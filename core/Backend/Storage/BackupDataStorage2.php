<?php


namespace Kontentblocks\Backend\Storage;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\Module;
use Kontentblocks\Panels\PostPanel;
use Kontentblocks\Utils\Utilities;

/**
 * Class BackupDataStorage
 * @package Kontentblocks
 * @subpackage Backend
 *
 * Interact with custom backup table
 */
class BackupDataStorage2
{
    /**
     * Instance of an Storage Object
     */
    protected $storage;

    /**
     * @var PostEnvironment
     */
    protected $environment;

    /**
     * Result from db query
     * Set of data for a given id
     * @var array
     */
    protected $package;

    /**
     * @var PostCloner
     */
    protected $cloner;

    /**
     * Class Constructor
     * @param PostEnvironment $environment
     */
    public function __construct(PostEnvironment $environment)
    {
        $this->environment = $environment;
        $this->storage = $environment->getStorage();
        $this->cloner = new PostCloner($environment);
    }

    /**
     * Remove backups for deleted posts
     * @param $postId
     */
    public static function deletePostCallback($postId)
    {
        global $wpdb;
        $wpdb->delete($wpdb->prefix . "kb_backups", array('post_id' => $postId));
    }

    /**
     * Insert Backup
     * Creates a new database entry
     * @param string $msg
     * @return bool|false|int
     */
    public function insertBackup($msg = '')
    {
        global $wpdb;

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (apply_filters('kb.backups.enabled', '__return_false') !== true) {
            return false;
        }


        $user = wp_get_current_user();

        $value = $this->cloner->prepareData();

        $value = json_encode(wp_slash($value));

        $data = array(
            'created' => date("Y-m-d H:i:s", time()),
            'updated' => date("Y-m-d H:i:s", time()),
            'value' => $value,
            'post_id' => $this->environment->getId(),
            'comment' => $msg,
            'username' => $user->user_login
        );

        wp_cache_delete('kb_backups_' . $data['post_id'], Utilities::getCacheGroup());
        $insertRecord = $wpdb->insert($wpdb->prefix . "kb_backups", $data);
        $this->cleanUp();
        update_post_meta($this->storage->getStorageId(), 'kb_last_backup', $insertRecord);
        return $insertRecord;
    }


    private function cleanUp()
    {
        $backups = $this->getAll();
        $remove = array_slice(array_reverse($backups), 8);
        foreach ($remove as $item) {
            $this->deleteEntry($item);
        }
    }

    /**
     * Query for existing backups
     * @return mixed
     */
    public function getAll()
    {
        global $wpdb;

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (apply_filters('kb.backups.enabled', '__return_false') !== true) {
            return [];
        }

        $backupid = $this->storage->getStorageId();
        $prefix = $wpdb->prefix;
        $cache = wp_cache_get('kb_backups_' . $backupid, Utilities::getCacheGroup());
        if ($cache !== false) {
            return $cache;
        } else {
            $sql = "SELECT * FROM {$prefix}kb_backups WHERE post_id = '{$backupid}'";
            $result = $this->prepareResults($wpdb->get_results($sql));
            wp_cache_set('kb_backups_' . $backupid, $result, Utilities::getCacheGroup());
            return $result;
        }

    }

    /**
     * @param $rows
     * @return array
     */
    private function prepareResults($rows)
    {
        return array_map(function ($row) {
            if (property_exists($row, 'value')) {
                if (is_string($row->value)) {
                    $row->value = wp_unslash(json_decode($row->value, true));
                }
            }
            return $row;
        }, $rows);

    }

    /**
     * @param $row
     * @return false|int
     */
    private function deleteEntry($row)
    {
        global $wpdb;

        wp_cache_delete('kb_backups_' . $this->environment->getId(), Utilities::getCacheGroup());
        if (isset($row->id) && is_numeric($row->id)) {
            return $wpdb->delete($wpdb->prefix . "kb_backups", array('id' => $row->id));
        }

    }


    /**
     * @param $backupId
     * @return bool
     */
    public function restoreBackup($backupId)
    {
        if (!apply_filters('kb.backups.enabled', '__return_true')) {
            return false;
        }

        global $wpdb;
        $row = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}kb_backups WHERE id = '{$backupId}'");
        if (!empty($row)) {
            $preped = $this->prepareResults(array($row));
            $prow = array_shift($preped);
            $indexMap = $this->diffIndex($prow->value['index']);
            $moduleData = $prow->value['modules'];
            $modules = $this->environment->getModuleRepository()->getModules();
            foreach (array_keys($indexMap['remove']) as $mid) {
                if (isset($modules[$mid])) {
                    do_action('kb.module.delete', $modules[$mid]);
                    delete_post_meta($this->environment->getId(), '_' . $mid);
                }
            }
            foreach (array_keys($indexMap['update']) as $mid) {
                if (isset($modules[$mid])) {
                    if (isset($moduleData['_' . $mid])) {
                        /** @var Module $module */
                        $module = $modules[$mid];
                        $data = $moduleData['_' . $mid];
                        $old = $this->environment->getStorage()->getModuleData($module->getId());
                        $new = $module->save($data, $old);
                        if ($new === false) {
                            $savedData = null;
                        } else {
                            $savedData = Utilities::arrayMergeRecursive($new, $old);
                        }
                        $module->updateModuleData($savedData);
                        $module->getModel()->sync(true);
                    }
                }
            }

            $this->storage->saveIndex($prow->value['index']);

            $panels = $this->environment->getPanels();
            $paneldata = $prow->value['panels'];
            /** @var PostPanel $panel */
            foreach ($panels as $panel) {
                $pid = $panel->getId();
                if (isset($paneldata[$pid])) {
                    $model = $panel->getModel()->set($paneldata[$pid]);
                    $model->sync();
                }
            }


            clean_post_cache($this->environment->getId());
            Utilities::remoteConcatGet($this->environment->getId());

        }
    }

    /**
     * @param $new
     * @return array
     */
    private function diffIndex($new)
    {
        $old = $this->environment->getStorage()->getIndex();
        $remove = array_diff_key($old, $new);
        $update = array_diff_key($new, $remove);
        return array(
            'remove' => $remove,
            'update' => $update
        );

    }


    /**
     * @param $timestamp
     */
    public function setTransient($timestamp)
    {
        set_transient('kb_last_backup', $timestamp);
    }


}