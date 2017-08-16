<?php

namespace Kontentblocks\Backend\Environment\Save;


use Kontentblocks\Backend\Storage\BackupDataStorage2;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SaveRevision
 * @package Kontentblocks\Backend\Environment\Save
 */
class SaveRevision
{

    /**
     * SaveRevision constructor.
     * @param $revisionId
     * @param $postId
     */
    public function __construct($revisionId, $postId)
    {
        $this->revisionId = $revisionId;
        $this->postId = $postId;
        $this->index = [];
        $this->savedModules = [];
        $this->originalEnv = Utilities::getPostEnvironment($postId);
        $this->environment = Utilities::getPostEnvironment($revisionId);
        $this->postdata = Request::createFromGlobals();
    }

    /**
     * @param $revisionId
     * @return bool
     *
     */
    public function save()
    {
        if ($this->auth() !== true) {
            return false;
        }

        $areas = $this->originalEnv->getAreas();
//        $panels = $this->originalEnv->getPanels();

        // Bail out if no areas are set
        if (empty($areas)) {
            return false;
        }

        foreach ($areas as $area) {
            if (!$this->saveByArea($area)) {
                continue;
            }
        }

//        $backupHandler = new BackupDataStorage2($this->originalEnv);
//        $data = $backupHandler->prepareData();
//
//        if (!isset($data['index']) || empty($data['index'])) {
//            return false;
//        }
//
//        update_metadata('post', $this->revisionId, 'kb_kontentblocks', $data['index']);
//
//        if (isset($data['modules']) && !empty($data['modules'])) {
//            foreach ($data['modules'] as $mid => $module) {
//                update_metadata('post', $this->revisionId, $mid, $module);
//            }
//        }
    }

    /**
     * @return bool
     */
    private function auth()
    {
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
        if (!current_user_can('edit_post', $this->originalEnv->getId())) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        return true;
    }

    /**
     *
     * @param $area
     * @return bool
     */
    private function saveByArea($area)
    {

        $moduleRepository = $this->originalEnv->getModuleRepository();
        $modules = $moduleRepository->getModulesforArea($area->id);
        $savedData = null;

        if (empty($modules)) {
            return false;
        }

        $this->saveModules($modules);

        return true;
    }

    /**
     * @param $modules
     */
    public function saveModules($modules)
    {

        /** @var \Kontentblocks\Modules\Module $module */
        foreach ($modules as $module) {
            if (!$this->postdata->request->has($module->getId())) {
                continue;
            }

            $data = wp_unslash($this->postdata->request->get($module->getId()));
            /** @var $old array */
            $old = $this->environment->getStorage()->getModuleData($module->getId());
            $module->updateModuleData($old);

            // check for draft and set to false
            // special block specific data
            $module = $this->moduleOverrides($module, $data);
            $module->properties->post_id = $this->revisionId;
            $module->properties->postId = $this->revisionId;

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
                $module->updateModuleData($savedData);
                $this->environment->getDataProvider()->update(Utilities::buildContextKey('_' . $module->getId()),
                    $module->model->export(), true);
            }
        }

        $this->environment->getStorage()->saveIndex($this->index);


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

}