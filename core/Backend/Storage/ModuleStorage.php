<?php
namespace Kontentblocks\Backend\Storage;

use Kontentblocks\Backend\DataProvider\DataProviderController;

/**
 * Class ModuleStorage
 * Mid-level wrapper to underlying data handler
 *
 * @package Kontentblocks
 * @subpackage Backend
 */
class ModuleStorage implements \Countable
{
    /**
     * current post id
     * @var int
     * @since 1.0.0
     */
    protected $storageId;

    /**
     * Module Index
     * @var array
     * @since 1.0.0
     */
    protected $index;

    /**
     * Data Handler
     * @var \Kontentblocks\Backend\DataProvider\DataProviderController
     * @since 1.0.0
     */
    protected $DataProvider;

    /**
     * modules to handle
     * @var array
     * @since 1.0.0
     */
    protected $modules;


    /**
     * Class constructor
     *
     * @param $postId
     * @param \Kontentblocks\Backend\DataProvider\DataProviderController
     *
     * @throws \Exception
     * @since 1.0.0
     */
    public function __construct( $postId, DataProviderController $DataProvider = null )
    {
        if (!isset( $postId ) || $postId === 0) {
            throw new \Exception( 'a valid post id must be provided' );
        }
        $this->storageId = $postId;
        // Late init data handler if not provided
        if (is_null( $DataProvider )) {
            $this->DataProvider = new DataProviderController( $postId );
        } else {
            $this->DataProvider = $DataProvider;
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
     * Getter for post id
     * @return int
     */
    public function getStorageId()
    {
        return $this->storageId;
    }

    /**
     * Getter for DataProviderController
     * @return DataProviderController
     */
    public function getDataProvider()
    {
        return $this->DataProvider;
    }


    /**
     * Saves the main index array to postmeta
     * @param array $index
     * @return bool
     */
    public function saveIndex( $index )
    {
        return $this->DataProvider->update( 'kb_kontentblocks', $index );

    }

    /**
     * Adds an module to the index and automatically saves
     * the module definition
     *
     * @param string $id module instance_id
     * @param array $args module attributes array
     *
     * @return mixed boolean
     */
    public function addToIndex( $id, $args )
    {
        $this->index[$id] = $args;
        if (!$this->getModuleData( $id )) {
            $this->saveModule( $id, '' );
        }
        return $this->saveIndex( $this->index );

    }

    /**
     * Remove a module from the index
     * @todo this->saveIndex > updateIndex
     *
     * @param $mid string
     * @return bool
     */
    public function removeFromIndex( $mid )
    {
        if (isset( $this->index[$mid] )) {
            unset( $this->index[$mid] );
            if ($this->saveIndex( $this->index ) !== false) {
                return $this->DataProvider->delete( '_' . $mid );
            }
        }

    }

    /**
     * Returns the module definition from index by instance id
     *
     * @param string $id
     * @return array|boolean
     */
    public function getModuleDefinition( $id )
    {
        if (isset( $this->index[$id] )) {
            return $this->index[$id];
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
        $this->getDataProvider()->reset();
        $this->setup();

        return $this;
    }

    /**
     * Setup Kontentblocks Data for post
     * @return ModuleStorage
     */
    private function setup()
    {
        $this->index = $this->DataProvider->get( 'kb_kontentblocks' );

        if (empty( $this->index )) {
            return false;
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
        $meta = $this->DataProvider->getAll();
        foreach (array_keys( $this->index ) as $id) {
            $collection['_' . $id] = ( !empty( $meta['_' . $id] ) ) ? $meta['_' . $id] : '';
            $collection['_preview_' . $id] = ( !empty( $meta['_preview_' . $id] ) ) ? $meta['_preview_' . $id] : '';
        }
        return $collection;

    }

    /**
     * Get module data by instance_id if available
     * Make sure that the given id is prefixed for hidden keys
     *
     * @param string $mid
     *
     * @return array|string|null
     */
    public function getModuleData( $mid )
    {
        $mid = $this->underscorePrefix( $mid );

        if (is_preview()) {
            $mid = '_preview' . $mid;
        }
        if (isset( $this->modules[$mid] )) {
            return $this->modules[$mid];
        }
        return null;
    }

    /**
     * Wrapper to save module data
     * Makes sure that the data is stored as hidden key
     * @todo: test if _ is given and don't prefix if so
     * @todo PMDataHandler should update
     *
     *
     * @param $id string $id
     * @param array|string $data array $data
     *
     * @return boolean | new
     */
    public function saveModule( $id, $data = '' )
    {
        return $this->DataProvider->update( '_' . $id, $data );
    }

    /**
     * Batch update Modules
     * Saves the module data arrays to postmeta
     *
     * @param array $modules
     *
     * @since 1.0.0
     */
    public function saveModules( $modules )
    {
        foreach (( array ) $modules as $id => $module) {
            $this->saveModule( $id, $module );
        }

    }

    /**
     * Wrapper to update the index meta data
     * @Todo PMDataHandler should update
     *
     * @since 1.0.0
     * @return bool
     *
     */
    public function _updateIndex()
    {
        return $this->DataProvider->update( 'kb_kontentblocks', $this->index );


    }

    /**
     * Getter for modules
     * @return array
     * @since 1.0.0
     */
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
    public function hasModules( $area )
    {
        if (!empty( $this->index )) {
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
     * @since 1.0.0
     */
    public function cleanIndex()
    {
        $cleaned = array();

        if (empty( $this->index )) {
            return $cleaned;
        }

        foreach ($this->index as $def) {
            if (isset( $def['class'] )) {
                $cleaned[$def['instance_id']] = $def;
            } else {
                // TODO remove from index;
            }
        }

        return $cleaned;

    }

    /**
     * Prepare and return the data to backup
     * @return array
     * @TODO: add filter
     * @since 1.0.0
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
     * Delete all module-related data
     * @since 1.0.0
     */
    public function deleteAll()
    {
        foreach ($this->getIndex() as $k => $module) {
            $this->DataProvider->delete( '_' . $k );
        }

        return $this->DataProvider->delete( 'kb_kontentblocks' );
    }

    /**
     * Handle data restore
     *
     * @param $data
     *
     * @since 1.0.0
     */
    public function restoreBackup( $data )
    {
        if (is_null( $data )) {
            return;
        }

        $index = $data['index'];
        $modules = $data['modules'];

        // delete old data
        if (!empty( $modules )) {
            foreach ($modules as $k => $value) {
                $this->DataProvider->delete( $k );

            }
        }
        $this->DataProvider->delete( 'kb_kontentblocks' );

        //set new old data from backup;
        $this->DataProvider->update( 'kb_kontentblocks', $index );


        if (!empty( $modules )) {
            foreach ($modules as $k => $value) {
                $this->DataProvider->update( $k, $value );
            }
        }
    }

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
        if (is_array( $this->index )) {
            return count( $this->index );
        }

        return 0;
    }

    private function underscorePrefix( $string )
    {
        if ($string[0] !== '_') {
            $string = '_' . $string;
        }
        return $string;
    }
}