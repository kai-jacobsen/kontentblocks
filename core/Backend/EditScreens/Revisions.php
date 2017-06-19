<?php

namespace Kontentblocks\Backend\EditScreens;


use Kontentblocks\Fields\Field;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

class Revisions
{

    /**
     * Add the main metabox
     */
    function __construct()
    {
        global $pagenow;
//        if ($pagenow === 'revision.php') {
        // add UI
        add_filter('_wp_post_revision_fields', array($this, 'wp_post_revision_fields'));
//        }
    }

    public function wp_post_revision_fields($return)
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


        // vars
        $post_id = 0;


        // determine $post_id
        if (isset($_POST['post_id'])) {
            $post_id = $_POST['post_id'];
        } elseif (isset($post->ID)) {
            $post_id = $post->ID;
        } else {
            return $return;
        }


        // get field objects
        $environment = Utilities::getPostEnvironment($post_id);
        $panels = $environment->getPanels();

        $modules = $environment->getModuleRepository()->getModules();
//        if ($fields) {
//            foreach ($fields as $field) {
//
//
//                // Add field key / label
//                $return[$field['key']] = $field['args']['label'];
//                // load value
//                add_filter('_wp_post_revision_field_' . $field['key'], array($this, 'wp_post_revision_field'), 10, 4);
//
//
//                // WP 3.5: left vs right
//                // Add a value of the revision ID (as there is no way to determine this within the '_wp_post_revision_field_' filter!)
//                if (isset($_GET['action'], $_GET['left'], $_GET['right']) && $_GET['action'] == 'diff') {
//                    global $left_revision, $right_revision;
//
//                    $left_revision->$field['key'] = 'revision_id=' . $_GET['left'];
//                    $right_revision->$field['key'] = 'revision_id=' . $_GET['right'];
//                }
//
//            }
//        }

        /** @var Module $module */
        foreach ($modules as $module) {
            $fields = $module->fields->export()->getFields();
            if ($fields) {
                foreach ($fields as $field) {
                    $label = (!empty($field['args']['label'])) ? $field['args']['label'] : 'Untitled';
                    $keyname = $module->properties->settings['name'] . ':' . $label;
                    $key = $module->getId() . ':rv:' . $field['key'];
                    // Add field key / label
                    $return[$key] = $keyname;
                    // load value
                    add_filter('_wp_post_revision_field_' . $key, array($this, 'revisionField'), 10,
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
    function revisionField($value, $field_name, $post = null, $direction = false)
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