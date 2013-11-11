<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Interfaces\InterfaceDataHandler;

class PostMetaDataHandler implements InterfaceDataHandler
{

    protected $post_id;
    protected $index   = array();
    protected $modules = array();
    protected $meta    = array();
    protected $package = array();

    public function __construct( $post_id )
    {
        if ( !isset( $post_id ) || $post_id === 0 ) {
            throw new \Exception( 'a valid post id must be provided' );
        }

        $this->post_id = $post_id;
        $this->_selfUpdate();


        return $this;

    }

    /**
     * Setup a package containing all Module-related data
     * @return self
     */
    public function pack()
    {
        $this->package = array(
            'index' => $this->index,
            'modules' => $this->modules,
            'supplemental' => $this->_getSupplementalBackupData()
        );
        return $this;

    }

    /**
     * Wrapper to retrieve data by key from post meta
     * @param id string Key
     */
    public function getMetaData( $id )
    {

        if ( !empty( $this->meta[ $id ] ) ) {
            return $this->meta[ $id ];
        }
        else {
            return null;
        }

    }

    /**
     * Makes sure the object stays in line with actual meta data
     * Should be called after any meta data modification
     */
    private function _selfUpdate()
    {
        $this->_getPostCustom();

    }

    /**
     * Saves the main index array to postmeta
     * @param array $index
     * @return type
     */
    public function saveIndex( $index )
    {
        return update_post_meta( $this->post_id, 'kb_kontentblocks', $index );

    }

    public function removeFromIndex( $id )
    {
        if ( isset( $this->index[ $id ] ) ) {
            unset( $this->index[ $id ] );
            if ( $this->saveIndex( $this->index ) !== false ) {
                return delete_post_meta( $this->post_id, '_' . $id );
            }
        }

    }

    /**
     * Returns the module definition from index by instance id
     * @param string $id
     * @return boolean
     */
    public function getModuleDefinition( $id )
    {
        if ( isset( $this->index[ $id ] ) ) {
            return $this->index[ $id ];
        }
        else {
            return false;
        }
    }

    /**
     * Caution! Deletes all Module related data from postmeta
     * @return self
     */
    public function delete()
    {

        foreach ( $this->index as $id => $module ) {
            delete_post_meta( $this->post_id, $id );
        }

        delete_post_meta( $this->post_id, 'kb_kontentblocks' );
        $this->_selfUpdate();

        return $this;

    }

    /**
     * returns the page template if isset
     * returns 'default' if not in order to normalize this module attribute
     * If post type doesn't support page templates, it's still
     * 'default' on the module
     * TODO: Could refer to template hierachie files as well?
     * @return string
     */
    public function getPageTemplate()
    {
        if ( !empty( $this->meta[ '_wp_page_template' ] ) ) {
            return $this->meta[ '_wp_page_template' ];
        }
        else if ( get_post_type( $this->post_id === 'page' ) && empty( $this->meta[ '_wp_page_template' ] ) ) {
            return 'default';
        }

    }

    /**
     * Gets all postmeta for current post.
     * Setup the Object.
     * @return self
     */
    private function _getPostCustom()
    {
        $this->meta = array_map( array( $this, 'maybe_unserialize_recursive' ), get_post_custom( $this->post_id ) );
        if ( empty( $this->meta[ 'kb_kontentblocks' ] ) ) {
            return false;
        }

        $this->index   = $this->meta[ 'kb_kontentblocks' ];
        $this->modules = $this->_setupModuleData( $this->meta );
        return $this;

    }

    /**
     * Normalizes module meta data
     * Modules are not _-prefixed in the index,
     * but are on the meta table..
     * @param array $meta
     * @return array
     */
    private function _setupModuleData( $meta )
    {
        foreach ( $this->index as $id => $data ) {
            $collection[ '_' . $id ] = (!empty( $meta[ '_' . $id ] )) ? $meta[ '_' . $id ] : '';
        }
        return $collection;

    }

    /**
     * Helper function get_post_custom
     */
    private function maybe_unserialize_recursive( $input )
    {
        return maybe_unserialize( $input[ 0 ] );

    }

    /**
     * Get module data by instance_id if available
     * Make sure that the given id is prefixed for hidden keys
     * TODO: Check prefix or auto-prefix
     * @param type $id
     * @return type
     */
    public function getModuleData( $id )
    {
        if ( isset( $this->modules[ '_' . $id ] ) ) {
            return $this->modules[ '_' . $id ];
        }

    }

    /**
     * Wrapper to save module data
     * Makes sure that the data is stored as hidden key
     * TODO: test if _ is given and don't prefix if so
     * @param string $id 
     * @param type $data
     * @return boolean | new meta id
     */
    public function saveModule( $id, $data = '' )
    {
        return update_post_meta( $this->post_id, '_' . $id, $data );

    }

    /**
     * Batch update Modules
     * Saves the module data arrays to postmeta
     * @param array $modules
     */
    public function saveModules( $modules )
    {
        foreach ( ( array ) $modules as $id => $module ) {
            $this->saveModule( $id, $module );
        }

    }

    /**
     * Simple wrapper to update_post_meta
     * @param string $id key
     * @param mixed $data value
     * @return boolean | new meta id
     */
    public function saveMetaData( $id, $data )
    {
        return update_post_meta( $this->post_id, $id, $data );

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
     * Adds an module to the index and automatically save
     * the module definition
     * @param string $id module instance_id
     * @param array $args module attributes array
     * @return mixed boolean | new meta id 
     */
    public function addToIndex( $id, $args )
    {
        $this->index[ $id ] = $args;
        if ( !isset( $this->meta[ '_' . $id ] ) ) {
            $this->saveModule( $id, '' );
        }

        return $this->_updateIndex();

    }

    /**
     * Wrapper to update the index meta data
     * @return void
     */
    private function _updateIndex()
    {
        return update_post_meta( $this->post_id, 'kb_kontentblocks', $this->index );

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
    public function hasModules( $area )
    {
        if ( !empty( $this->index ) ) {
            foreach ( $this->index as $module ) {
                if ( $module[ 'area' ] === $area && $module[ 'draft' ] !== 'true' && $module[ 'active' ] !== false ) {
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

        foreach ( $this->index as $def ) {
            if ( isset( $def[ 'settings' ][ 'class' ] ) ) {
                $cleaned[ $def[ 'instance_id' ] ] = $def;
            }
            else {
                // TODO remove from index;
            }
        }

        return $cleaned;

    }

    // -----------------------------------
    // Backups
    // -----------------------------------

    /**
     * Get the array of backup packages
     * @return mixed array() | false
     */
    public function getBackups()
    {
        if ( !empty( $this->meta[ '_kb_backup' ] ) ) {
            return $this->meta[ '_kb_backup' ];
        }
        else {
            return false;
        }

    }

    /**
     * Gets a single backup bucket from  the collection
     * overwrites index and modules data
     * deletes other post meta and restores from backup
     * @param string $timestamp
     * @return boolean
     */
    public function restoreBackup( $timestamp )
    {
        $backup = $this->_getBackupBucket( $timestamp );
        if ( $backup ) {
            $this->saveIndex( $backup[ 'data' ][ 'index' ] );
            $this->saveModules( $backup[ 'data' ][ 'modules' ] );
            $this->saveSupplemental( $backup[ 'data' ][ 'supplemental' ] );
            $this->_selfUpdate();
            return true;
        }
        return false;

    }

    /**
     * get the right bucket from backups by timestamp (unix)
     * @param integer unix $timestamp
     * @return mixed false or array of data
     */
    private function _getBackupBucket( $timestamp )
    {
        if ( $this->getBackups() ) {
            $backups = $this->getBackups();
            if ( isset( $backups[ $timestamp ] ) ) {
                return $backups[ $timestamp ];
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }

    }

    /**
     * Stores the current set of module related data into the backup collection
     * An additionell log message may be provided
     * @param string $logmsg
     * @return self
     */
    public function backup( $logmsg = '' )
    {
        if ( !$this->package ) {
            $this->pack();
        }

        $user = wp_get_current_user();

        $backup_data                   = $this->_getBackupData();
        $now                           = time();
        $backup_data[ $now ][ 'data' ] = $this->package;
        $backup_data[ $now ][ 'msg' ]  = $logmsg . ' (by ' . $user->user_login . ')';

        update_post_meta( $this->post_id, '_kb_backup', array_slice( $backup_data, -8, 8, true ) );
        $this->_selfUpdate();
        return $this;

    }

    /**
     * internal helper to get the collection or at least an empty array
     * to start a new collection
     * @return array()
     */
    private function _getBackupData()
    {
        if ( !empty( $this->meta[ '_kb_backup' ] ) ) {
            return $this->meta[ '_kb_backup' ];
        }
        else {
            return array();
        }

    }

    /**
     * Returns all non kontentblocks related meta data
     * @return array
     */
    public function _getSupplementalBackupData()
    {
        $meta      = $this->meta;
        $index     = $this->index;
        $blacklist = array( 'kb_kontentblocks', '_edit_lock', '_sidebars_updated', '_kb_backup' );

        if ( !empty( $index ) ) {
            foreach ( $index as $k => $v ) {
                unset( $meta[ $k ] );
            }
        }

        foreach ( $blacklist as $key ) {
            unset( $meta[ $key ] );
        }

        return $meta;

    }

    /**
     * Saves non kontentblocks related meta data
     * @param type $data
     */
    public function saveSupplemental( $data )
    {
        foreach ( $data as $key => $value ) {
            delete_post_meta( $this->post_id, $key );
            add_post_meta( $this->post_id, $key, $value );
        }

    }

}
