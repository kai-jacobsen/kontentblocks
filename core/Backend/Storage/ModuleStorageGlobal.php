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

    /**
     * Setup the working state for the provided area
     * @return $this|bool
     */
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
        // todo: validate $index
        $this->index = $index;
        return $this->_updateIndex();
    }

    /**
     * Add a module definition to the index
     * Index gets updated afterwards
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

    /**
     * Remove module from index an delete corresponding data
     * @param strinf $id module instance id
     * @return bool true on success, false on failure
     */
    public function removeFromIndex($id)
    {
        if (isset($this->index[$id])) {
            unset($this->index[$id]);
            if ($this->_updateIndex() !== false) {
                return $this->DataBackend->delete($id);
            }
        }
    }

    /**
     * Get a module definition from index
     * @param string $id module instance id
     * @return bool false if not set
     * @return array if set
     */
    public function getModuleDefinition($id)
    {
        if (isset($this->index[$id])) {
            return $this->index[$id];
        } else {
            return false;
        }
    }

    /**
     * Get data for module
     * @param string $id module instance id
     * @return array data if exists
     * @return null if no data
     */
    public function getModuleData($id)
    {
        if (isset($this->modules[$id][0])) {
            return $this->modules[$id][0];
        }

        return null;
    }

    /**
     * Save module data to table
     * @param $id module instance id
     * @param array|string $data data array
     * @return bool true|false success|failure
     */
    public function saveModule($id, $data = '')
    {
        return $this->DataBackend->update($id, $data);
    }

    /**
     * Wrapper to ::saveModule, batch mode
     * @param array $modules
     */
    public function saveModules($modules)
    {

        foreach (( array )$modules as $id => $module) {
            $this->saveModule($id, $module);
        }
    }

    /**
     * Store index to table
     * @return bool true|false success|failure
     */
    public function _updateIndex()
    {
        return $this->DataBackend->update('index', $this->index);
    }

    /**
     * Get all modules
     */
    public function getModules()
    {
        // TODO: Implement getModules() method.
    }

    /**
     * Check if area has modules
     * @param string $area
     */
    public function hasModules($area)
    {
        // TODO: Implement hasModules() method.
    }

    /**
     * Prepare the data to backup
     * Gets called by the BackupManager,
     * which expects the data to save in return
     */
    public function backup()
    {
        // TODO: Implement backup() method.
    }

    /**
     * Rearrange modules to an associative array
     * with the instance id as key
     * @return array
     */
    private function setupModuleData()
    {
        $collection = array();
        $meta = $this->DataBackend->getAll();
        foreach ($this->index as $id => $data) {
            $collection[$id] = (!empty($meta[$id])) ? $meta[$id] : '';
        }
        return $collection;
    }

    /**
     * Returns the AreaTableAPI Instance
     * @return AreaTableAPI
     */
    public function getDataBackend(){
        return $this->DataBackend;
    }


}