<?php

namespace Kontentblocks\Backend\Environment\Save;

use Kontentblocks\Backend\Environment\GlobalEnvironment;
use Kontentblocks\Interfaces\InterfaceSaveHandler;
use Kontentblocks\Modules\ModuleFactory;

class SaveGlobal implements InterfaceSaveHandler
{

    protected $Environment;
    protected $index;

    public function __construct(GlobalEnvironment $Environment)
    {
        $this->Environment = $Environment;
    }

    public function save()
    {
        if (!$this->auth()) {
            return false;
        }

        $this->index = $this->Environment->getStorage()->getIndex();

        $modules = $this->Environment->getAllModules();


        if (empty($modules)) {
            return false;
        }

        // create backup
        $this->createBackup();

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
                $this->Environment->getStorage()->saveModule($module['instance_id'], $savedData);
            }


        }
        $this->Environment->getStorage()->saveIndex($this->index);


    }


    private function moduleOverrides($module, $data)
    {
        $module['overrides']['name'] = (!empty($data['block_title'])) ? $data['block_title'] : $module['overrides']['name'];
        $module['state']['draft'] = false;
        return $module;
    }


    private function createBackup()
    {
        // @TODO implement method
    }

    private function auth()
    {
        return true;
    }

}