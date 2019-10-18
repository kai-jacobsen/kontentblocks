<?php

namespace Kontentblocks\Backend\Storage;

use Kontentblocks\Backend\DataProvider\DataProvider;

/**
 * Class ModuleStorage
 * Mid-level wrapper to underlying data handler to handle module related data
 */
class ModuleStorage implements \Countable
{
    /**
     * current post id
     * @var int
     */
    protected $storageId;

    /**
     * Module Index
     * @var array
     */
    protected $index;

    /**
     * Data Handler
     * @var \Kontentblocks\Backend\DataProvider\DataProvider
     */
    protected $dataProvider;

    /**
     * modules to handle
     * @var array
     */
    protected $modules = [];


    /**
     * Class constructor
     *
     * @param $postId
     * @param \Kontentblocks\Backend\DataProvider\DataProvider
     * @throws \Exception
     */
    public function __construct($postId, DataProvider $dataProvider = null)
    {
        $this->storageId = $postId;
        // Late init data handler if not provided
        if (is_null($dataProvider)) {
            $this->dataProvider = new DataProvider($postId, 'post');
        } else {
            $this->dataProvider = $dataProvider;
        }
        $this->setup();

    }

    /**
     * Setup Kontentblocks Data for post
     * @return ModuleStorage
     */
    private function setup()
    {
        $this->index = $this->dataProvider->get('kb_kontentblocks');
        if (empty($this->index)) {
            return $this;
        }
        $this->modules = $this->setupModuleData();
        return $this;

    }

    /**
     * Normalizes module meta data
     * Modules are not _-prefixed in the index,
     * but are on the meta table..
     * @return array
     */
    private function setupModuleData()
    {
        $collection = array();
        $meta = $this->dataProvider->getAll();
        foreach (array_keys($this->index) as $id) {
            $collection['_' . $id] = (!empty($meta['_' . $id])) ? $meta['_' . $id] : '';
            $collection['_preview_' . $id] = (!empty($meta['_preview_' . $id])) ? $meta['_preview_' . $id] : null;
        }
        return $collection;

    }

    /**
     * Getter for post id
     * @return int
     */
    public function getStorageId()
    {
        return $this->storageId;
    }

    /**
     * Adds an module to the index and automatically saves
     * the module definition
     *
     * @param string $mid module mid
     * @param array $args module attributes array
     * @return mixed boolean
     */
    public function addToIndex($mid, $args)
    {
        $this->index[$mid] = $args;
        if (!$this->getModuleData($mid)) {
            $this->saveModule($mid, '');
        }
        return $this->saveIndex($this->index);

    }

    /**
     * Get module data by mid if available
     * Make sure that the given id is prefixed for hidden keys
     *
     * @param string $mid
     *
     * @return array|string|null
     */
    public function getModuleData($mid, $default = null)
    {
        $mid = $this->underscorePrefix($mid);
        if (is_preview()) {
            $pmid = '_preview' . $mid;
            if (isset($this->modules[$pmid])) {
                return $this->modules[$pmid];
            } elseif (isset($this->modules[$mid])) {
                return $this->modules[$mid];
            }
        }

        if (isset($this->modules[$mid])) {
            return $this->modules[$mid];
        }
        return $default;
    }

    /**
     * Test if first char is an underscore
     * KB meta data should be hidden from custom fields meta box
     * @param $string
     * @return string
     */
    private function underscorePrefix($string)
    {
        if ($string[0] !== '_') {
            $string = '_' . $string;
        }
        return $string;
    }

    /**
     * Wrapper to save module data
     * Makes sure that the data is stored as hidden key
     * @param $id string $id
     * @param array|string $data array $data
     *
     * @param bool $addslashes
     * @return bool
     */
    public function saveModule($id, $data = '', $addslashes = false)
    {
        if ($addslashes && $this->dataProvider->addSlashes()) {
            $data = wp_slash($data);
        }
        return $this->dataProvider->update($this->underscorePrefix($id), $data);
    }

    /**
     * Saves the main index array to postmeta
     * @param array $index
     * @return bool
     */
    public function saveIndex($index)
    {
        $index = apply_filters('kb.index.update', $index);
        return $this->dataProvider->update('kb_kontentblocks', $index, false);

    }

    /**
     * Remove a module from the index
     * @todo this->saveIndex > updateIndex
     *
     * @param $mid string
     * @return bool
     */
    public function removeFromIndex($mid)
    {
        if (isset($this->index[$mid])) {
            unset($this->index[$mid]);
            if ($this->saveIndex($this->index) !== false) {
                return $this->dataProvider->delete('_' . $mid);
            }
        }

    }

    /**
     * Returns the module definition from index by instance id
     *
     * @param string $mid
     * @return array|boolean
     */
    public function getModuleDefinition($mid)
    {
        if (isset($this->index[$mid])) {
            return $this->index[$mid];
        } else {
            return false;
        }

    }

    /**
     * This will reload the post meta data and re-init this object
     * @return ModuleStorage
     */
    public function reset()
    {
        if (is_admin()){
            $this->getDataProvider()->reset();
            $this->setup();
        }

        return $this;
    }

    /**
     * Getter for DataProvider
     * @return DataProvider
     */
    public function getDataProvider()
    {
        return $this->dataProvider;
    }

    /**
     * Batch update Modules
     * Saves the module data arrays to postmeta
     *
     * @param array $modules
     *
     * @since 0.1.0
     */
    public function saveModules($modules)
    {
        foreach (( array )$modules as $id => $module) {
            $this->saveModule($id, $module);
        }

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
                if ($module->area->id === $area && $module['draft'] !== 'true' && $module['active'] !== false) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Prepare and return the data to backups
     * @return array
     */
    public function backup()
    {
        return array(
            'id' => $this->storageId,
            'index' => $this->getIndex(),
            'modules' => $this->getModules()
        );
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
     * Returns an array with the mid as key
     * @return array
     */
    public function cleanIndex()
    {
        $cleaned = array();

        if (empty($this->index)) {
            return $cleaned;
        }

        foreach ($this->index as $def) {
            if (isset($def['class'])) {
                $cleaned[$def['mid']] = $def;
            } else {
                // TODO remove from index;
            }
        }

        return $cleaned;

    }

    /**
     * Getter for modules
     * @return array
     * @since 0.1.0
     */
    public function getModules()
    {
        return $this->modules;
    }

    /**
     * Delete all module-related data
     */
    public function deleteAll()
    {
        foreach (array_keys($this->getIndex()) as $k) {
            $this->dataProvider->delete('_' . $k);
        }

        return $this->dataProvider->delete('kb_kontentblocks');
    }

//    /**
//     * Handle data restore
//     * @param $data
//     */
//    public function restoreBackup($data)
//    {
//        if (is_null($data)) {
//            return;
//        }
//
//        $index = $data['index'];
//        $modules = $data['modules'];
//
//        // delete old data
//        if (!empty($modules)) {
//            foreach ($modules as $k => $value) {
//                $this->dataProvider->delete($k);
//
//            }
//        }
//        $this->dataProvider->delete('kb_kontentblocks');
//        //set new old data from backup;
//        $this->dataProvider->update('kb_kontentblocks', $index);
//
//        if (!empty($modules)) {
//            foreach ($modules as $k => $value) {
//                $this->dataProvider->update($k, $value);
//            }
//        }
//    }

    /**
     * (PHP 5 &gt;= 5.1.0)<br/>
     * Count elements of an object
     * @link http://php.net/manual/en/countable.count.php
     * @return int The custom count as an integer.
     * </p>
     * <p>
     * The return value is cast to an integer.
     */
    public function count()
    {
        if (is_array($this->index)) {
            return count($this->index);
        }

        return 0;
    }
}