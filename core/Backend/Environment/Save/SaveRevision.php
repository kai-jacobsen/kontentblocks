<?php

namespace Kontentblocks\Backend\Environment\Save;


use Kontentblocks\Backend\Storage\PostCloner;
use Kontentblocks\Modules\Module;
use Kontentblocks\Panels\PostPanel;
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
        global $pagenow;
        $this->isRevisionScreen = (filter_input(INPUT_GET, 'action',
                FILTER_SANITIZE_STRING) === 'restore' && $pagenow === 'revision.php');
        $this->revisionId = $revisionId;
        $this->postId = $postId;
        $this->index = [];
        $this->savedModules = [];

        $getRev = filter_input(INPUT_GET, 'revision', FILTER_SANITIZE_NUMBER_INT);
        $this->refId = ($this->isRevisionScreen && is_numeric($getRev)) ? $getRev : $postId;

        $this->originalEnv = Utilities::getPostEnvironment($postId);
        $this->environment = Utilities::getPostEnvironment($revisionId);
        $this->postdata = $this->setupRequestData();

    }

    /**
     * Either use real request data or fake request data
     * @return Request
     */
    private function setupRequestData()
    {
        if (!$this->isRevisionScreen) {
            return Utilities::getRequest();
        }

        /*
         * Mock postdata when restoring a revision
         */
        $cloner = new PostCloner(Utilities::getPostEnvironment($this->refId));
        $kbdata = $cloner->prepareData();
        $modules = $this->unprefixModules($kbdata['modules']);
        $panels = $kbdata['panels'];
        $merged = array_merge($modules, $panels);
        return new Request([], $merged);

    }

    /**
     * @param $modules
     * @return array
     */
    private function unprefixModules($modules)
    {

        $unprefixed = [];
        foreach ($modules as $mid => $value) {

            if (is_string($mid) && $mid[0] === '_') {
                $key = ltrim($mid, '_');
                $unprefixed[$key] = $value;
            }
        }

        return $unprefixed;
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


        $this->savePanels();


    }

    /**
     * @return bool
     */
    private function auth()
    {

        // if a revision gets restored, a new revision is created but everything from the normal edit screen is missing
        if ($this->isRevisionScreen === true) {
            return true;
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

    private function savePanels()
    {

        $panels = $this->originalEnv->getPanels();
        /** @var PostPanel $panel */
        foreach ($panels as $panel) {
            $args = $panel->getArgs();
            $class = get_class($panel);
            /** @var PostPanel $newPanel */
            $newPanel = new $class($args, $this->environment);
            $newPanel->model->reset()->set($this->postdata->request->get($newPanel->getBaseId()));
            $newPanel->save($this->postdata);
        }
    }

}