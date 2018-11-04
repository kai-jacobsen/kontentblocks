<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\BackupDataStorage2;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class BackupInspect
 * @package Kontentblocks\Extensions
 */
class BackupInspect
{

    /**
     * Class Constructor
     */
    public function __construct()
    {
        if (apply_filters('kb.backups.enabled', '__return_false') === true) {
            add_action('add_meta_boxes', array($this, 'addMetaBox'), 15, 2);
            add_action('wp_ajax_get_backups', array($this, 'getBackups'));
            add_action('init', array($this, 'observeQuery'), 99);
            add_filter('heartbeat_received', array($this, 'heartbeatReceive'), 10, 2);
        }
    }

    /**
     * Add Backup list meta box to enabled post types
     */
    public function addMetaBox()
    {
        $screen = get_current_screen();

        if (post_type_supports($screen->post_type, 'kb.backups.ui')) {
            add_meta_box(
                'kb-backup-inspect',
                'Kontenblocks Backup',
                array($this, 'controls'),
                $screen->post_type,
                'side',
                'high'
            );
        }


    }

    /**
     * Meta Box inner content html
     */
    public function controls()
    {
        echo "<div id='backup-inspect'></div>";

    }


    /**
     * Observe request for any relevant actions
     */
    public function observeQuery()
    {
        $request = Utilities::getRequest();
        if (is_numeric($request->query->get('restore_backup', null))) {
            $location = remove_query_arg(array('restore_backup', 'post_id'));
            $this->restoreBackup($_GET['post_id'], $_GET['restore_backup']);
            wp_redirect($location);
            exit;
        }

    }

    /**
     * restore a backup
     *
     * @param $post_id int post id
     * @param $id string id of target backup (a timestamp most likely)
     */
    public function restoreBackup($post_id, $id)
    {
        $environment = Utilities::getPostEnvironment($post_id);
        $backupManager = new BackupDataStorage2($environment);
        $backupManager->restoreBackup($id);
    }

    /**
     * Ajax callback to get a list of all backups for a post
     */
    public function getBackups()
    {
        check_ajax_referer('kb-read');
        $request = Utilities::getRequest();
        $postId = $request->request->get('post_id', null);

        if (is_null($postId)) {
            return new AjaxErrorResponse('No post id provided', []);
        }

        $environment = Utilities::getPostEnvironment($postId);
        $backupManager = new BackupDataStorage2($environment);
        $items = array_map(function ($row) {
            unset($row->value);
            return $row;
        }, $backupManager->getAll());
        return new AjaxSuccessResponse('Backups retrieved', $items);

    }

    /**
     * Checks if new backups were created and sends the new list if new backups were found
     *
     * @param $response array
     * @param $data array
     *
     * @return mixed
     */
    public function heartbeatReceive($response, $data)
    {
        if (isset($data['kbBackupWatcher']) && $data['kbBackupWatcher'] != null) {

            if ($data['kbBackupWatcher']['id'] == get_post_meta($data['post_id'], 'kb_last_backup', true)) {
                $response['kbHasNewBackups'] = false;
            } else {
                $environment = Utilities::getPostEnvironment($data['post_id']);
                $backupManager = new BackupDataStorage2($environment);
                $backups = $backupManager->getAll();
                $response['hmm'] = update_post_meta($data['post_id'], 'kb_last_backup', $data['kbBackupWatcher']['id']);
                $response['kbHasNewBackups'] = (!empty($backups)) ? $backups : array();
            }
        }
        return $response;
    }

}
