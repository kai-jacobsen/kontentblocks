<?php

namespace Kontentblocks\Backend\EditScreens;


use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Panels\PostPanel;
use Kontentblocks\Utils\Utilities;

class Revisions
{

    /**
     * Add the main metabox
     */
    function __construct()
    {
        global $pagenow;
        add_filter('_wp_post_revision_fields', array($this, 'revisionFields'),99);
        add_action('wp_restore_post_revision', array($this, 'restoreRevision'), 10, 2);
    }

    /**
     * @param $postId
     * @param $revisionId
     * @return bool
     */
    public function restoreRevision($postId, $revisionId)
    {
        $revEnvironment = Utilities::getPostEnvironment($revisionId);
        $postEnvironment = Utilities::getPostEnvironment($postId);

        if (is_null($revEnvironment) || is_null($postEnvironment)) {
            return false;
        }

        /*
         * Modules
         * restore index from revision to post
         */

        $revIndex = $revEnvironment->getStorage()->getIndex();
        $postEnvironment->getStorage()->deleteAll();
        $postEnvironment->getStorage()->saveIndex($revIndex);


        /*
         * Modules
         * restore module data from revision to post
         */

        foreach ($revIndex as $module) {
            $mid = $module['mid'];
            $data = $revEnvironment->getStorage()->getModuleData($mid);
            $postEnvironment->getStorage()->saveModule($mid, $data);
        }

        /*
         * Panels
         * Get panels from post
         */
        $panels = $postEnvironment->getPanels();

        /*
         * restore panel data from revision to post
         */
        /** @var PostPanel $panel */
        foreach ($panels as $panel) {

            $provider = $revEnvironment->getDataProvider();
            $data = $provider->get($panel->getId());
            $panel->getModel()->set($data)->sync();
        }

        /*
         * re-evaluate post_content
         */
        Utilities::remoteConcatGet($postId, true);

    }

    /**
     * @param $return
     * @return mixed
     */
    public function revisionFields($return)
    {

        //globals
        global $post, $pagenow;

        // validate
        $allowed = false;


        // Normal revisions page
        if ($pagenow == 'revision.php') {
            $allowed = true;
        }


        // WP 3.6 AJAX revision
        if ($pagenow == 'admin-ajax.php' && isset($_POST['action']) && $_POST['action'] == 'get-revision-diffs') {
            $allowed = true;
        }

        // bail
        if (!$allowed) {
            return $return;
        }


        // determine $post_id
        if (isset($_POST['post_id'])) {
            $postId = $_POST['post_id'];
        } elseif (isset($post->ID)) {
            $postId = $post->ID;
        } else {
            return $return;
        }



        // get field objects
        $environment = Utilities::getPostEnvironment($postId);
        $panels = $environment->getPanels();
        $modules = $environment->getModuleRepository()->getModules();




        /** @var PostPanel $panel */
        foreach ($panels as $panel) {
            $fields = $panel->fields->export()->getFields();
            if ($fields) {
                foreach ($fields as $field) {
                    $label = (!empty($field['args']['label'])) ? $field['args']['label'] : 'Untitled';
                    $keyname = $panel->class . ':' . $label;
                    $fieldkey = (!empty($field['arrayKey'])) ? $field['arrayKey'] : $field['key'];
                    $key = $panel->getId() . ':rv:' . $fieldkey;
                    // Add field key / label
                    $return[$key] = $keyname;
                    // load value
                    add_filter('_wp_post_revision_field_' . $key, array($this, 'panelRevisionField'), 10,
                        4);


                    // WP 3.5: left vs right
                    // Add a value of the revision ID (as there is no way to determine this within the '_wp_post_revision_field_' filter!)
                    if (isset($_GET['action'], $_GET['left'], $_GET['right']) && $_GET['action'] == 'diff') {
                        global $left_revision, $right_revision;

                        $left_revision->$key = 'revision_id=' . $_GET['left'];
                        $right_revision->$key = 'revision_id=' . $_GET['right'];
                    }

                }
            }
        }

        /** @var Module $module */
        foreach ($modules as $module) {
            if (!is_a($module->fields, StandardFieldController::class)) {
                continue;
            }

            $fields = $module->fields->export()->getFields();
            if ($fields) {
                foreach ($fields as $field) {
                    $label = (!empty($field['args']['label'])) ? $field['args']['label'] : 'Untitled';
                    $keyname = $module->properties->settings['name'] . ':' . $label;
                    $fieldkey = (!empty($field['arrayKey'])) ? $field['arrayKey'] : $field['key'];


                    $key = $module->getId() . ':rv:' . $fieldkey;
                    // Add field key / label
                    $return[$key] = $keyname;
                    // load value
                    add_filter('_wp_post_revision_field_' . $key, array($this, 'moduleRevisionField'), 10,
                        4);


                    // WP 3.5: left vs right
                    // Add a value of the revision ID (as there is no way to determine this within the '_wp_post_revision_field_' filter!)
                    if (isset($_GET['action'], $_GET['left'], $_GET['right']) && $_GET['action'] == 'diff') {
                        global $left_revision, $right_revision;

                        $left_revision->$key = 'revision_id=' . $_GET['left'];
                        $right_revision->$key = 'revision_id=' . $_GET['right'];
                    }

                }
            }
        }
        return $return;

    }

    /**
     * @param $value
     * @param $field_name
     * @param null $post
     * @param bool $direction
     * @return mixed|string
     */
    function panelRevisionField($value, $field_name, $post = null, $direction = false)
    {
        $split = explode(':rv:', $field_name);
        $mid = $split[0];
        $field = $split[1];
        $value = $this->getValueForFieldOfPanel($mid, $field, $post, $direction);
//        d($value);
        return $value;
    }

    /**
     * @param $panelId
     * @param $field
     * @param $post
     * @param $direction
     * @return mixed|string
     */
    private function getValueForFieldOfPanel($panelId, $field, $post, $direction)
    {

        $environment = Utilities::getPostEnvironment($post->ID);
        $provider = $environment->getDataProvider();
        $panelData = $provider->get($panelId);
        if (!$panelData) {
            return '';
        }

        $parentEnv = Utilities::getPostEnvironment($post->post_parent);
        $panel = $parentEnv->getPanelObject($panelId);

        if (!$panel) {
            return '';
        }

        $fields = $panel->fields->collectAllFields();
        if (isset($fields[$field])) {
            /** @var Field $field */
            $field = $fields[$field];
            $value = (isset($panelData[$field->getKey()])) ? $panelData[$field->getKey()] : '';
            return var_export($value, true);
        }

        return '';

    }

    /**
     * @param $value
     * @param $field_name
     * @param null $post
     * @param bool $direction
     * @return mixed|string
     */
    function moduleRevisionField($value, $field_name, $post = null, $direction = false)
    {
        $split = explode(':rv:', $field_name);
        $mid = $split[0];
        $field = $split[1];
        $value = $this->getValueForFieldOfModule($mid, $field, $post, $direction);
        return $value;
    }

    /**
     * @param $mid
     * @param $field
     * @param $post
     * @param $direction
     * @return mixed|string
     */
    private function getValueForFieldOfModule($mid, $field, $post, $direction)
    {

        $environment = Utilities::getPostEnvironment($post->ID);
        $storage = $environment->getStorage();
        $moduleDef = $storage->getModuleDefinition($mid);

        if (!$moduleDef) {
            return '';
        }

        $workshop = new ModuleWorkshop($environment, $moduleDef);
        $module = $workshop->getModule();
        $fieldController = $module->fields;
        $fieldController->updateData();
        $fields = $fieldController->collectAllFields();

        if (isset($fields[$field])) {
            /** @var Field $field */
            $field = $fields[$field];
            $value = $field->getValue();
            return var_export($value, true);
        }

        return '';

    }


}