<?php


namespace Kontentblocks\Backend\Storage;

use Kontentblocks\Utils\Utilities;

/**
 * Class BackupDataStorage
 * @package Kontentblocks
 * @subpackage Backend
 * @since 0.1.0
 *
 * Interact with custom backup table
 */
class BackupDataStorage
{
    /**
     * Instance of an Storage Object
     */
    protected $storage;

    /**
     * Result from db query
     * Set of data for a given id
     * @var array
     */
    protected $package;

    /**
     * Data for backup as returned by the Storage instance
     * @var array
     */
    protected $backupData;

    /**
     * Class Constructor
     * An Storageobject must be given
     * @param ModuleStorage $storage
     * @throws \BadFunctionCallException
     */
    public function __construct( ModuleStorage $storage )
    {
        $this->storage = $storage;
    }

    /**
     * Remove backups for deleted posts
     * @param $postId
     */
    public static function deletePostCallback( $postId )
    {
        global $wpdb;
        $wpdb->delete( $wpdb->prefix . "kb_backups", array( 'post_id' => $postId ) );
    }

    /**
     * Backup method
     * Gets the backup data from the Storage object
     * @param $logmsg string supplemental information for the specific backup
     */
    public function backup( $logmsg = '' )
    {
        $this->backupData = $this->storage->backup();
        $this->msg = $logmsg;
        $this->save();
    }

    /**
     * Save
     * This methods checks if there is existing data
     * and calls submethods accordingly
     */
    private function save()
    {
        // query database for backup data, if not already done
        if (!$this->package) {
            $this->package = $this->getPackage();
        }

        // If there is no data yet, insert new backup
        // else update existing data
        if (empty( $this->package )) {
            $this->insertBackup();
        } else {
            $this->updateBackup();
        }
    }

    /**
     * Get existing backup data
     * @return array
     */
    public function getPackage()
    {
        $backupid = $this->backupData['id'];
        return $this->queryBackup( $backupid );

    }

    /**
     * Query for existing backups
     * @param $backupid string post id or global area id
     * @return mixed
     */
    public function queryBackup( $backupid = null )
    {
        global $wpdb;

        if (!current_user_can( 'edit_posts' )) {
            return false;
        }

        if (is_null($backupid)){
            $backupid = $this->storage->getStorageId();
        }

        $prefix = $wpdb->prefix;

        $cache = wp_cache_get( 'kb_backups_' . $backupid, Utilities::getCacheGroup() );
        if ($cache !== false) {
            return $cache;
        } else {
            $sql = "SELECT * FROM {$prefix}kb_backups WHERE post_id = '{$backupid}'";
            $result = $wpdb->get_row( $sql );
            wp_cache_set( 'kb_backups_' . $backupid, $result, Utilities::getCacheGroup() );
            return $result;
        }


    }

    public function getBackups(){
        try{
            $string = base64_decode($this->queryBackup( )->value);
            if (is_string($string)){
                return unserialize($string);
            }
        } catch(\Exception $e) {
            return array();
        }
    }

    /**
     * Insert Backup
     * Creates a new database entry
     * @todo nonces
     */
    private function insertBackup()
    {
        global $wpdb;

        if (!current_user_can( 'edit_posts' )) {
            return false;
        }

        $insert = array();
        $user = wp_get_current_user();

        $value = array(
            'index' => $this->backupData['index'],
            'modules' => $this->backupData['modules']
        );

        $now = time();
        $insert[$now]['data'] = $value;
        $insert[$now]['msg'] = $this->msg . ' (by ' . $user->user_login . ')';


        $data = array(
            'created' => date( "Y-m-d H:i:s", time() ),
            'updated' => date( "Y-m-d H:i:s", time() ),
            'value' => base64_encode( serialize( $insert ) ),
            'post_id' => ( is_numeric( $this->backupData['id'] ) ) ? $this->backupData['id'] : - 1
        );

        //set reference
        update_post_meta( $this->storage->getStorageId(), 'kb_last_backup', $now );
        wp_cache_delete( 'kb_backups_' . $data['post_id'], Utilities::getCacheGroup() );
        return $wpdb->insert( $wpdb->prefix . "kb_backups", $data );
    }

    /**
     * Update Backup
     * updates existing data with
     */
    private function updateBackup()
    {
        global $wpdb;

        $existingData = unserialize( base64_decode( $this->package->value ) );
        $user = wp_get_current_user();

        $value = array(
            'index' => $this->backupData['index'],
            'modules' => $this->backupData['modules']
        );

        $now = time();
        $existingData[$now]['data'] = $value;
        $existingData[$now]['msg'] = $this->msg . ' (by ' . $user->user_login . ')';

        // truncate, never more than 8 backups
        $backupLimit = apply_filters( 'kb_backups_to_keep', 8 );
        $existingData = array_slice( $existingData, - $backupLimit, $backupLimit, true );

        $data = array(
            'updated' => date( "Y-m-d H:i:s", time() ),
            'value' => base64_encode( serialize( $existingData ) )
        );
//        $this->Storage->getDataProvider()->update('kb_last_backup', $now);
        update_post_meta( $this->storage->getStorageId(), 'kb_last_backup', $now );

        wp_cache_delete( 'kb_backups_' . $this->backupData['id'], 'kontentblocks' );

        return $wpdb->update( $wpdb->prefix . "kb_backups", $data, array( 'id' => $this->package->id ) );
    }

    /**
     * Restoring the data must be handled by the Storage
     * @param $id
     */
    public function restoreBackup( $id )
    {
        $this->storage->restoreBackup( $this->getBucket( $id ) );

    }

    /**
     * Returns a single backup entry from the collection
     * @param $id string
     * @return mixed array of data or NULL
     */
    public function getBucket( $id )
    {

        if (!$this->package) {
            $this->package = $this->getPackage();
        }

        $backupData = unserialize( base64_decode( $this->package->value ) );
        if (isset( $backupData[$id] )) {
            return $backupData[$id]['data'];
        } else {
            return NULL;
        }
    }

    public function setTransient( $timestamp )
    {
        set_transient( 'kb_last_backup', $timestamp );
    }

}