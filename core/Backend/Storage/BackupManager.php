<?php


namespace Kontentblocks\Backend\Storage;

/**
 * Class BackupManager
 * @package Kontentblocks
 * @subpackage Backend
 * @since 1.0.0
 *
 * Interact with custom backup table
 */
class BackupManager
{
    /**
     * Instance of an Storage Object
     */
    protected $Storage;

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
     * @param ModuleStoragePostMeta $Storage
     * @throws \BadFunctionCallException
     */
    public function __construct($Storage)
    {
        if (!$Storage) {
            throw new \BadFunctionCallException('A Storage Object must be given');
        }

        $this->Storage = $Storage;
    }

    public static function deletePostCallback($post_id)
    {
        global $wpdb;
        $wpdb->delete($wpdb->prefix . "kb_backups", array('post_id' => $post_id));
    }

    /**
     * Backup method
     * Gets the backup data from the Storage object
     * @param $logmsg string supplemental information for the specific backup
     */
    public function backup($logmsg = '')
    {
        $this->backupData = $this->Storage->backup();
        $this->msg = $logmsg;
        $this->save();
    }

    /**
     * Save
     * This methods checks if there is existing data
     * and calls submethods accordingly
     */
    public function save()
    {
        // query database for backup data, if not already done
        if (!$this->package) {
            $this->package = $this->getPackage();
        }

        // If there is no data yet, insert new backup
        // else update existing data
        if (empty($this->package)) {
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
        $id = $this->backupData['id'];

        return $this->queryBackup($id);


    }

    /**
     * Query for existing backups
     * @param $id string post id or global area id
     * @return object
     */
    public function queryBackup($id)
    {
        global $wpdb;

        if (!current_user_can('edit_kontentblocks')) {
            wp_die('Hackin?');
        }

        $prefix = $wpdb->prefix;

        $cache = wp_cache_get('kb_backups_'.$id, 'kontentblocks');
        if ($cache !== false) {
            return $cache;
        } else {
	        // @TODO Use $wpdb
            $sql = "SELECT * FROM {$prefix}kb_backups WHERE post_id = '{$id}' OR literal_id = '{$id}'";
            $result = $wpdb->get_row($sql);
            wp_cache_set('kb_backups_'.$id, $result, 'kontentblocks');
            return $result;
        }


    }

    /**
     * Insert Backup
     * Creates a new database entry
     * @todo nonces
     */
    public function insertBackup()
    {
        global $wpdb;

        if (!current_user_can('edit_kontentblocks')) {
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
            'created' => date("Y-m-d H:i:s", time()),
            'updated' => date("Y-m-d H:i:s", time()),
            'value' => serialize(stripslashes_deep($insert)),
            'post_id' => (is_numeric($this->backupData['id'])) ? $this->backupData['id'] : -1,
            'literal_id' => (!is_numeric($this->backupData['id'])) ? $this->backupData['id'] : NULL
        );

        //set reference
        $this->Storage->getDataHandler()->update('kb_last_backup', $now);
        wp_cache_delete('kb_backups_'.$data['post_id'], 'kontentblocks');
        return $wpdb->insert($wpdb->prefix . "kb_backups", $data);
    }

    /**
     * Update Backup
     * updates existing data with
     */
    public function updateBackup()
    {
        global $wpdb;

        if (!current_user_can('edit_kontentblocks')) {
            wp_die('Hackin?');
        }

        $existingData = unserialize($this->package->value);
        $user = wp_get_current_user();

        $value = array(
            'index' => $this->backupData['index'],
            'modules' => $this->backupData['modules']
        );

        $now = time();
        $existingData[$now]['data'] = $value;
        $existingData[$now]['msg'] = $this->msg . ' (by ' . $user->user_login . ')';

        // truncate, never more than 8 backups
        $backupLimit = apply_filters('kb_backups_to_keep', 8);
        $existingData = array_slice($existingData, -$backupLimit, $backupLimit, true);

        $data = array(
            'updated' => date("Y-m-d H:i:s", time()),
            'value' => serialize(stripslashes_deep($existingData))
        );

        $this->Storage->getDataHandler()->update('kb_last_backup', $now);

        wp_cache_delete('kb_backups_'.$this->backupData['id'], 'kontentblocks');

        return $wpdb->update($wpdb->prefix . "kb_backups", $data, array('id' => $this->package->id));
    }

    public function restoreBackup($id)
    {
        $this->Storage->restoreBackup($this->getBucket($id));

    }

    /**
     * Returns a single backup entry from the collection
     * @param $id string
     * @return mixed array of data or NULL
     */
    public function getBucket($id)
    {

        if (!$this->package) {
            $this->package = $this->getPackage();
        }

        $backupData = unserialize($this->package->value);
        if (isset($backupData[$id])) {
            return $backupData[$id]['data'];
        } else {
            return NULL;
        }
    }

    public function setTransient($timestamp)
    {
        set_transient('kb_last_backup', $timestamp);

    }

}