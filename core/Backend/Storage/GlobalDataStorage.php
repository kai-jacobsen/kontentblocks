<?php

namespace Kontentblocks\Backend\Storage;

use Kontentblocks\Interfaces\InterfaceDataStorage;

class GlobalDataStorage implements InterfaceDataStorage{

    /**
     * Get the index of the attached modules
     *
     * Returns an array of module definitions as arrays
     * @return array
     */
    public function getIndex()
    {
        // TODO: Implement getIndex() method.
    }

    /**
     * Saves the index to the database
     *
     * @param $index
     * @return boolean Indicates whether update was successful or failed
     */
    public function saveIndex($index)
    {
        // TODO: Implement saveIndex() method.
    }

    /**
     * Add a module definition to the index
     * Index should get updated  afterwards
     * @param string $id Unique id of module i.e. instance_id
     * @param array $args module definition array
     * @return boolean Indicates whether update was succesful or failed
     */
    public function addToIndex($id, $args)
    {
        // TODO: Implement addToIndex() method.
    }

    public function removeFromIndex($id)
    {
        // TODO: Implement removeFromIndex() method.
    }

    public function getModuleDefinition($id)
    {
        // TODO: Implement getModuleDefinition() method.
    }

    public function getModuleData($id)
    {
        // TODO: Implement getModuleData() method.
    }

    public function saveModule($id, $data = '')
    {
        // TODO: Implement saveModule() method.
    }

    public function saveModules($modules)
    {
        // TODO: Implement saveModules() method.
    }

    public function _updateIndex()
    {
        // TODO: Implement _updateIndex() method.
    }

    public function getModules()
    {
        // TODO: Implement getModules() method.
    }

    public function hasModules($area)
    {
        // TODO: Implement hasModules() method.
    }
}