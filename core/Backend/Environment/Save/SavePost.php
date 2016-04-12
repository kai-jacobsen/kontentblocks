<?php

namespace Kontentblocks\Backend\Environment\Save;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SavePost
 * @package Kontentblocks\Backend\Environment\Save
 */
class SavePost
{

    protected $environment;
    protected $index = null;
    protected $savedModules = array();

    /**
     * @var Request
     */
    private $postdata;

    public function __construct(PostEnvironment $environment)
    {
        $this->environment = $environment;
        $this->postid = $environment->getId();
        $this->postdata = Request::createFromGlobals();
        $this->index = $this->environment->getStorage()->getIndex();
    }


    /**
     * Save method for post related modules
     * @return false    if auth fails or areas are empty
     */
    public function save()
    {
        // mic check one two, one two
        if ($this->auth() === false) {
            return false;
        }
        $areas = $this->environment->getAreas();

        // Bail out if no areas are set
        if (empty($areas)) {
            return false;
        }


        // create backup
        $this->createBackup();
        foreach ($areas as $area) {
            if (!$this->saveByArea($area)) {
                continue;
            }
        }
        $this->concat();
        $this->saveAreaContextMap();
        $this->saveEditLayouts();
        // finally update the index
        $this->saveIndex();
    }

    /**
     * Various checks
     * @return bool
     */
    private function auth()
    {
        $all = $this->postdata->request->all();
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty($all)) {
            return false;
        }

        if (is_null($this->postdata->request->getInt('blog_id', null))) {
            return false;
        } else {
            $blogIdSubmit = $this->postdata->request->getInt('blog_id', null);
            $blogIdCurrent = get_current_blog_id();
            if ((int)$blogIdSubmit !== (int)$blogIdCurrent) {
                return false;
            }
        }
        if (is_null($this->postdata->request->filter('kb_noncename', null, FILTER_SANITIZE_STRING))) {
            return false;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce(
            $this->postdata->request->filter('kb_noncename', '', FILTER_SANITIZE_STRING),
            'kontentblocks_save_post'
        )
        ) {
            return false;
        }

        // Check permissions
        if (!current_user_can('edit_post', $this->postid)) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (get_post_type($this->postid) == 'revision' && !is_null($this->postdata->get('wp-preview'))) {
            return false;
        }

        if ($this->environment->getPostType() == 'revision') {
            return false;
        }

        // checks passed
        return true;
    }

    /**
     * Make a backup of old data
     */
    private function createBackup()
    {
        // Backup data, not for Previews
        if (!isset($_POST['wp-preview'])) {
            $backupManager = new BackupDataStorage($this->environment->getStorage());
            $backupManager->backup('Before regular update');
        }
    }

    /**
     *
     * @param $area
     * @return bool
     */
    private function saveByArea($area)
    {

        $moduleRepository = $this->environment->getModuleRepository();
        $modules = $moduleRepository->getModulesforArea($area->id);
        $savedData = null;

        if (empty($modules)) {
            return false;
        }

        $this->saveModules($modules);

        return true;
    }

    public function saveModules($modules)
    {
        /** @var \Kontentblocks\Modules\Module $module */
        foreach ($modules as $module) {
            if (!$this->postdata->request->has($module->getId())) {
                continue;
            }

            // new data from $_POST
            //TODO: filter incoming data
            $data = wp_unslash($this->postdata->request->get($module->getId()));
            /** @var $old array */
            $old = $this->environment->getStorage()->getModuleData($module->getId());
            $module->updateModuleData($old);
            // check for draft and set to false
            // special block specific data
            $module = $this->moduleOverrides($module, $data);
            $module->properties->post_id = $this->postid;
            $module->properties->postId = $this->postid;

            // create updated index
            $this->index[$module->getId()] = $module->properties->export();
            $this->savedModules[$module->getId()] = $module->properties->export();
            // call save method on block
            // ignore the existence

            if ($data === null) {
                $savedData = $old;
            } else {
                $new = $module->save($data, $old);
                if ($new === false) {
                    $savedData = null;
                } else {
                    $savedData = Utilities::arrayMergeRecursive($new, $old);
                }
            }
            // if this is a preview, save temporary data for previews
            if (!is_null($savedData)) {

                if ($this->postdata->request->get('wp-preview') && $this->postdata->request->get('wp-preview') === 'dopreview') {
                    $this->environment->getDataProvider()->update('_preview_' . $module->getId(), $savedData);
                } // save real data
                else {
                    $this->environment->getDataProvider()->delete('_preview_' . $module->getId());

                }
                $module->updateModuleData($savedData);
                $module->getModel()->sync(true);
            }
        }

        $backupManager = new BackupDataStorage($this->environment->getStorage());
        $backupManager->backup("Post updated");

    }

    /**
     * @param $module
     * @param $data
     *
     * @return mixed
     */
    protected function moduleOverrides(Module $module, $data)
    {
        $module->properties->viewfile = (!empty($data['viewfile'])) ? $data['viewfile'] : '';
        $module->properties->overrides = (!empty($data['overrides'])) ? $data['overrides'] : array();
        $module->properties->state['draft'] = false;

        return $module;
    }

    public function concat()
    {
        Utilities::remoteConcatGet($this->postid, true);
    }

    private function saveAreaContextMap()
    {
        $contexts = filter_input(INPUT_POST, 'kbcontext', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        if (!empty($contexts)) {
            $this->environment->getDataProvider()->update('_kbcontexts', $contexts);
        }
    }

    private function saveEditLayouts()
    {
        $layout = filter_input(INPUT_POST, 'kb_edit_layout', FILTER_SANITIZE_STRING);
        if (!empty($layout)) {
            $this->environment->getDataProvider()->update('_kb.editScreen.layout', $layout);
        }

    }

    public function saveIndex()
    {

        $this->environment->getStorage()->saveIndex($this->index);
    }

    public function getIndex()
    {
        return $this->index;
    }

    public function getSavedModules()
    {
        return $this->savedModules;
    }


}