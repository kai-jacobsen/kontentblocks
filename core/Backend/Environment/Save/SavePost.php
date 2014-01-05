<?php

namespace Kontentblocks\Backend\Environment\Save;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\BackupManager;
use Kontentblocks\Interfaces\InterfaceSaveHandler;
use Kontentblocks\Modules\ModuleFactory;

class SavePost implements InterfaceSaveHandler
{

    protected $Environment;
    protected $index = null;

    public function __construct(PostEnvironment $Environment)
    {
        $this->Environment = $Environment;
        $this->postid = $Environment->getId();
    }


    /**
     * Save method for post related modules
     * @todo move the code from EditScreen to a new file (done)
     * @todo split this in chunks
     * @return void
     */
    public function save()
    {
        // mic check one two, one two
        if (!$this->auth()) {
            return false;
        }


        $this->index = $this->Environment->getStorage()->getIndex();

        $areas = $this->Environment->getAreas();

        // Bail out if no areas are set
        if (empty($areas)) {
            return false;
        }

        // create backup
        $this->createBackup();

        foreach ($areas as $area) {

            /** @var $modules array */
            $modules = $this->Environment->getModulesforArea($area['id']);
            $savedData = null;

            if (empty($modules)) {
                continue;
            }

            foreach ($modules as $module) {
                if (!class_exists($module['class'])) {
                    continue;
                }

                //hack
                $id = null;

                // new data from $_POST
                //TODO: filter incoming data
                $data = (!empty($_POST[$module['instance_id']])) ? $_POST[$module['instance_id']] : null;

                /** @var $old array() */
                $old = $this->Environment->getStorage()->getModuleData($module['instance_id']);

                // create Module instance

                $Factory = new ModuleFactory($module['class'], $module, $this->Environment);

                /** @var $instance \Kontentblocks\Modules\Module */
                $instance = $Factory->getModule();
                // Set the 'old' data to the module
                $instance->moduleData = $old;

                // check for draft and set to false
                // special block specific data
                $module = $this->moduleOverrides($module, $data);

                // create updated index
                $this->index[$module['instance_id']] = $module;

                // call save method on block
                // ignore the existence

                if ($data === null) {
                    $new = $old;
                } else {
                    $new = $instance->save($data, $old);
                    $savedData = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);
                }


                // store new data in post meta
                // if this is a preview, save temporary data for previews
                if ($savedData) {
                    if ($_POST['wp-preview'] === 'dopreview') {
                        update_post_meta($this->postid, '_preview_' . $module['instance_id'], $savedData);
                    } // save real data
                    else {
                        $this->Environment->getStorage()->saveModule($module['instance_id'], $savedData);
                        delete_post_meta($this->postid, '_preview_' . $module['instance_id']);
                    }
                }


            }

            // save area settings which are specific to this post (ID-wise)
            if (!empty($_POST['areas'])) {

                $collection = $this->Environment->getDataBackend()->get('kb_area_settings');

                $areasData = $_POST['areas'];

                if (isset($areasData[$area['id']])) {
                    $collection[$area['id']] = $areasData[$area['id']];

                }

                $this->Environment->getDataBackend()->update('kb_area_settings', $collection);
            }
        }
        // finally update the index
        $this->Environment->getStorage()->saveIndex($this->index);
    }


    private function moduleOverrides($module, $data)
    {
        $module['overrides']['name'] = (!empty($data['block_title'])) ? $data['block_title'] : $module['overrides']['name'];
        $module['state']['draft'] = false;
        return $module;
    }


    /**
     * Various checks
     * @return bool
     */
    private function auth()
    {
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty($_POST)) {
            return false;
        }

        if (empty($_POST['kb_noncename'])) {
            return false;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce($_POST['kb_noncename'], 'kontentblocks_save_post')) {
            return false;
        }

        // Check permissions
        if (!current_user_can('edit_post', $this->postid)) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (get_post_type($this->postid) == 'revision' && !isset($_POST['wp-preview'])) {
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
        if (!isset($_POST['wp_preview'])) {
            $BackupManager = new BackupManager($this->Environment->getStorage());
            $BackupManager->backup('Before regular update');
        }
    }


}