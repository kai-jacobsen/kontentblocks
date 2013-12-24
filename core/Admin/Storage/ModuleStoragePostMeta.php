<?php
namespace Kontentblocks\Admin\Storage;

use Kontentblocks\Admin\Post\PostMetaDataHandler;
use Kontentblocks\Interfaces\InterfaceDataStorage;

class ModuleStoragePostMeta implements InterfaceDataStorage
{

    protected $post_id;
    protected $index;
    protected $MetaData;

    public function __construct($post_id, PostMetaDataHandler $MetaData = null)
    {
        if (!isset($post_id) || $post_id === 0) {
            throw new \Exception('a valid post id must be provided');
        }

        $this->post_id = $post_id;

        if (is_null($MetaData)){
            $this->MetaData = new PostMetaDataHandler($post_id);
        } else {
            $this->MetaData = $MetaData;
        }
        $this->setup();

    }

    /**
     * Returns an clean index
     * Makes sure that the keys on the array a properly set
     * TODO: Don't return non existing modules
     * @return array
     */
    public function getIndex()
    {
        return $this->cleanIndex();

    }


    /**
     * Saves the main index array to postmeta
     * @param array $index
     * @todo: Move this to PMDataHandler
     * @return type
     */
    public function saveIndex($index)
    {
        return update_post_meta($this->post_id, 'kb_kontentblocks', $index);

    }

    /**
     * Adds an module to the index and automatically save
     * the module definition
     * @param string $id module instance_id
     * @param array $args module attributes array
     * @return mixed boolean | new meta id
     */
    public function addToIndex($id, $args)
    {
        $this->index[$id] = $args;
        if (!isset($this->meta['_' . $id])) {
            $this->saveModule($id, '');
        }

        return $this->_updateIndex();

    }

    /**
     * Remove a module from the index
     * @todo PMDataHandler should delete
     * @param $id string
     * @return bool
     */
    public function removeFromIndex($id)
    {
        if (isset($this->index[$id])) {
            unset($this->index[$id]);
            if ($this->saveIndex($this->index) !== false) {
                return delete_post_meta($this->post_id, '_' . $id);
            }
        }

    }

    /**
     * Returns the module definition from index by instance id
     * @param string $id
     * @return boolean
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
     * Setup Kontentblocks Data for post
     * @return self
     */
    private function setup()
    {
        if (empty($this->MetaData->getMetaData('kb_kontentblocks'))) {
            return false;
        }
        $this->index = $this->MetaData->getMetaData('kb_kontentblocks');
        $this->modules = $this->_setupModuleData();
        return $this;

    }


    /**
     * Normalizes module meta data
     * Modules are not _-prefixed in the index,
     * but are on the meta table..
     * @return array
     */
    private function _setupModuleData()
    {
        $meta = $this->MetaData->getCompleteDataset();
        foreach ($this->index as $id => $data) {
            $collection['_' . $id] = (!empty($meta['_' . $id])) ? $meta['_' . $id] : '';
            $collection['_preview_' . $id] = (!empty($meta['_preview_' . $id])) ? $meta['_preview_' . $id] : '';
        }
        return $collection;

    }

    /**
     * Get module data by instance_id if available
     * Make sure that the given id is prefixed for hidden keys
     * @param type $id
     * @return type
     */
    public function getModuleData($id)
    {

        if ($id[0] !== '_') {
            $id = '_' . $id;
        }

        if (is_preview()) {
            $id = '_preview' . $id;
        }

        if (isset($this->modules[$id])) {
            return $this->modules[$id];
        }

    }

    /**
     * Wrapper to save module data
     * Makes sure that the data is stored as hidden key
     * @todo: test if _ is given and don't prefix if so
     * @todo PMDataHandler should update
     * @param $id string $id
     * @param $data array $data
     * @return boolean | new meta id
     */
    public function saveModule($id, $data = '')
    {
        return update_post_meta($this->post_id, '_' . $id, $data);

    }

    /**
     * Batch update Modules
     * Saves the module data arrays to postmeta
     * @param array $modules
     */
    public function saveModules($modules)
    {
        foreach (( array )$modules as $id => $module) {
            $this->saveModule($id, $module);
        }

    }

    /**
     * Wrapper to update the index meta data
     * @Todo PMDataHandler should update
     * @return void
     */
    public function _updateIndex()
    {
        return update_post_meta($this->post_id, 'kb_kontentblocks', $this->index);

    }


    public function getModules()
    {
        return $this->modules;

    }


    /**
     * Checks if there are stored modules for a given area
     * Stops looking after a first valid module was found
     * @param string $area
     * @return boolean
     */
    public function hasModules($area)
    {
        if (!empty($this->index)) {
            foreach ($this->index as $module) {
                if ($module['area'] === $area && $module['draft'] !== 'true' && $module['active'] !== false) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns an array with the instance_id as key
     * @return type
     */
    public function cleanIndex()
    {
        $cleaned = array();

        foreach ($this->index as $def) {
            if (isset($def['class'])) {
                $cleaned[$def['instance_id']] = $def;
            } else {
                // TODO remove from index;
            }
        }
        return $cleaned;

    }
}