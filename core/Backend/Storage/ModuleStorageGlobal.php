<?php

namespace Kontentblocks\Backend\Storage;

use Kontentblocks\Backend\API\AreaTableAPI;
use Kontentblocks\Interfaces\InterfaceDataStorage;

class ModuleStorageGlobal implements InterfaceDataStorage
{

    protected $index = array();

    public function __construct($id)
    {
        $this->areaId = $id;
        $this->DataBackend = new AreaTableAPI($id);

        $this->setup();

    }

    private function setup()
    {
        $this->DataBackend->setId($this->areaId);

        $index = $this->DataBackend->get('index');

        // no index, no modules, no fun
        if (!$index) {
            return false;
        }

        $this->index = $index;
        $this->modules = $this->setupModuleData();
        return $this;
    }


    /**
     * Get the index of the attached modules
     *
     * Returns an array of module definitions as arrays
     * @return array
     */
    public function getIndex()
    {
        return $this->index;
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
        $this->index[$id] = $args;
        if (!$this->getModuleData($id)) {
            $this->saveModule($id);
        }

        return $this->_updateIndex();
    }

    public function removeFromIndex($id)
    {
        if (isset($this->index[$id])) {
            unset($this->index[$id]);
            if ($this->_updateIndex() !== false) {
                return $this->DataBackend->delete($id);
            }
        }
    }

    public function getModuleDefinition($id)
    {
        if (isset($this->index[$id])) {
            return $this->index[$id];
        } else {
            return false;
        }
    }

    public function getModuleData($id)
    {
        if (isset($this->modules[$id][0])) {
            return $this->modules[$id][0];
        }

        return null;
    }

    public function saveModule($id, $data = '')
    {
        return $this->DataBackend->update($id, $data);
    }

    public function saveModules($modules)
    {

        foreach (( array )$modules as $id => $module) {
            $this->saveModule($id, $module);
        }
    }

    public function _updateIndex()
    {
        return $this->DataBackend->update('index', $this->index);
    }

    public function getModules()
    {
        // TODO: Implement getModules() method.
    }

    public function hasModules($area)
    {
        // TODO: Implement hasModules() method.
    }

    public function backup()
    {
        // TODO: Implement backup() method.
    }

    private function setupModuleData()
    {
        $collection = array();
        $meta = $this->DataBackend->getAll();
        foreach ($this->index as $id => $data) {
            $collection[$id] = (!empty($meta[$id])) ? $meta[$id] : '';
        }
        return $collection;
    }

    public function getDataBackend(){
        return $this->DataBackend;
    }


}