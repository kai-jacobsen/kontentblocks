<?php

namespace Kontentblocks\Admin\Post;


/**
 * Class PostMetaDataHandler
 * @package Kontentblocks\Admin\Post
 * @todo: extract backup routine
 * @todo: create a custom table storage alternative
 * @todo update Interface
 */
class PostMetaDataHandler
{

    protected $post_id;
    protected $index = array();
    protected $modules = array();
    protected $meta = array();
    protected $package = array();

    public function __construct($post_id)
    {
        if (!isset($post_id) || $post_id === 0) {
            throw new \Exception('a valid post id must be provided');
        }

        $this->post_id = $post_id;
        $this->_selfUpdate();

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
            'modules' => $this->modules,
            'supplemental' => $this->_getSupplementalBackupData()
        );
        return $this;

    }

    /**
     * Wrapper to retrieve data by key from post meta
     * @param id string Key
     */
    public function getMetaData($id)
    {
        if (!empty($this->meta[$id])) {
            return $this->meta[$id];
        } else {
            return null;
        }

    }

    public function getCompleteDataset(){
        return $this->meta;
    }


    /**
     * Caution! Deletes all Module related data from postmeta
     * @return self
     */
    public function delete()
    {

        foreach ($this->index as $id => $module) {
            delete_post_meta($this->post_id, $id);
        }

        delete_post_meta($this->post_id, 'kb_kontentblocks');
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
        if (!empty($this->meta['_wp_page_template'])) {
            return $this->meta['_wp_page_template'];
        } else if (get_post_type($this->post_id === 'page') && empty($this->meta['_wp_page_template'])) {
            return 'default';
        }

    }

    /**
     * Get Post Type by postid
     */
    public function getPostType()
    {
        return get_post_type($this->post_id);

    }

    /**
     * Gets all postmeta for current post.
     * Setup the Object.
     * @return self
     */
    private function _getPostCustom()
    {
        $this->meta = array_map(array($this, 'maybe_unserialize_recursive'), get_post_custom($this->post_id));
        return $this;

    }


    /**
     * Helper function get_post_custom
     */
    private function maybe_unserialize_recursive($input)
    {
        return maybe_unserialize($input[0]);

    }


    /**
     * Simple wrapper to update_post_meta
     * @param string $id key
     * @param mixed $data value
     * @return boolean | new meta id
     */
    public function saveMetaData($id, $data)
    {
        return update_post_meta($this->post_id, $id, $data);

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
        if (!empty($this->meta['_kb_backup'])) {
            return $this->meta['_kb_backup'];
        } else {
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
    public function restoreBackup($timestamp)
    {
        $backup = $this->_getBackupBucket($timestamp);
        if ($backup) {
            $this->saveIndex($backup['data']['index']);
            $this->saveModules($backup['data']['modules']);
            $this->saveSupplemental($backup['data']['supplemental']);
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
    private function _getBackupBucket($timestamp)
    {
        if ($this->getBackups()) {
            $backups = $this->getBackups();
            if (isset($backups[$timestamp])) {
                return $backups[$timestamp];
            } else {
                return false;
            }
        } else {
            return false;
        }

    }

    /**
     * Stores the current set of module related data into the backup collection
     * An additionell log message may be provided
     * @param string $logmsg
     * @return self
     */
    public function backup($logmsg = '')
    {
        if (!$this->package) {
            $this->pack();
        }

        $user = wp_get_current_user();

        $backup_data = $this->_getBackupData();
        $now = time();
        $backup_data[$now]['data'] = $this->package;
        $backup_data[$now]['msg'] = $logmsg . ' (by ' . $user->user_login . ')';

        update_post_meta($this->post_id, '_kb_backup', array_slice($backup_data, -8, 8, true));
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
        if (!empty($this->meta['_kb_backup'])) {
            return $this->meta['_kb_backup'];
        } else {
            return array();
        }

    }

    /**
     * Returns all non kontentblocks related meta data
     * @return array
     */
    public function _getSupplementalBackupData()
    {
        $meta = $this->meta;
        $index = $this->index;
        $blacklist = array('kb_kontentblocks', '_edit_lock', '_sidebars_updated', '_kb_backup');

        if (!empty($index)) {
            foreach ($index as $k => $v) {
                unset($meta[$k]);
            }
        }

        foreach ($blacklist as $key) {
            unset($meta[$key]);
        }

        return $meta;

    }

    /**
     * Saves non kontentblocks related meta data
     * @param type $data
     */
    public function saveSupplemental($data)
    {
        foreach ($data as $key => $value) {
            delete_post_meta($this->post_id, $key);
            add_post_meta($this->post_id, $key, $value);
        }

    }

}
