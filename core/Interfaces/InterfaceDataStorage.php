<?php

namespace Kontentblocks\Interfaces;

interface InterfaceDataStorage
{

    /**
     * Get the index of the attached modules
     *
     * Returns an array of module definitions as arrays
     * @return array
     */
    public function getIndex();

    /**
     * Saves the index to the database
     *
     * @param $index
     * @return boolean Indicates whether update was successful or failed
     */
    public function saveIndex($index);

    /**
     * Add a module definition to the index
     * Index should get updated  afterwards
     * @param string $id Unique id of module i.e. instance_id
     * @param array $args module definition array
     * @return boolean Indicates whether update was succesful or failed
     */
    public function addToIndex($id, $args);

    public function removeFromIndex($id);

    public function getModuleDefinition($id);

    public function getModuleData($id);

    public function saveModule($id, $data = '');

    public function saveModules($modules);

    public function _updateIndex();

    public function getModules();

    public function hasModules($area);
}
