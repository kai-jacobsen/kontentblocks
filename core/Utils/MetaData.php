<?php

namespace Kontentblocks\Utils;

class MetaData
{

    protected $post_id;
    protected $index   = array();
    protected $modules = array();
    protected $meta    = array();
    protected $package = array();

    public function __construct( $post_id )
    {
        if ( !isset( $post_id ) || $post_id === 0 ) {
            throw new Exception( 'a valid post id must be provided' );
        }

        $this->post_id = $post_id;
        $this->_selfUpdate();

        return $this;

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
     * Get Backup and update post meta
     * @param string $timestamp
     * @return boolean
     */
    public function restoreBackup( $timestamp )
    {
        $backup = $this->_getBackupBucket( $timestamp );
        if ( $backup ) {
            $this->saveIndex( $backup[ 'data' ][ 'index' ] );
            $this->saveModules( $backup[ 'data' ][ 'modules' ] );
            $this->_selfUpdate();
            return true;
        }
        return false;

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
     * Setup a package containing all Module-related data
     * @return self
     */
    public function pack()
    {
        $this->package = array(
            'index' => $this->index,
            'modules' => $this->modules
        );
        return $this;

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

    /**
     * Saves the module data arrays to postmeta
     * @param array $modules
     */
    public function saveModules( $modules )
    {

        foreach ( ( array ) $modules as $id => $module ) {
            update_post_meta( $this->post_id, '_' . $id, $module );
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

    public function saveModule( $id, $data )
    {
        return update_post_meta( $this->post_id, '_' . $id, $data );

    }

    public function getIndex()
    {
        return $this->index;

    }

    public function getModules()
    {
        return $this->modules;

    }

    public function hasModules( $area )
    {
        if ( !empty( $this->index ) ) {
            foreach ( $this->index as $module ) {
                if ( $module[ 'area' ] === $area && $module[ 'draft' ] !== 'true' && $module[ 'status' ] !== 'kb_inactive' ) {
                    return true;
                }
            }
        }
        return false;

    }

}
