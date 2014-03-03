<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Backend\Storage\BackupManager;

class Backup_Inspect
{

    public function __construct()
    {
        add_action('init', array($this, 'postTypeSupport'));
        add_action('add_meta_boxes', array($this, 'addMetaBox'), 15, 2);
        add_action('wp_ajax_get_backups', array($this, 'getBackups'));
        add_action('init', array($this, 'observeQuery'));
        add_filter('heartbeat_received', array($this, 'heartbeatReceive'), 10, 2);

    }

    public function addMetaBox()
    {
        $screen = get_current_screen();

        if (post_type_supports($screen->post_type, 'backup-inspect')) {
            add_meta_box('kb-backup-inspect', 'Kontenblocks Backup', array($this, 'controls'), $screen->post_type, 'side', 'high');
        }


    }

    public function controls()
    {
        echo "<div id='backup-inspect'></div>";

    }

    public function postTypeSupport()
    {
        add_post_type_support('page', 'backup-inspect');

    }

    public function observeQuery()
    {
        if (isset($_GET['restore_backup'])) {

            $location = add_query_arg(array('restore_backup' => false, 'post_id' => false));
            $this->restoreBackup($_GET['post_id'], $_GET['restore_backup']);
            wp_redirect($location);
        }

    }

    public function restoreBackup($post_id, $id)
    {

        $Storage = \Kontentblocks\Helper\getStorage($post_id);

        $BackupManager = new BackupManager($Storage);
        $BackupManager->backup('before backup restore');
        $BackupManager->restoreBackup($id);

    }

    public function getBackups()
    {
        $post_id = $_REQUEST['post_id'];

        $Storage = \Kontentblocks\Helper\getStorage($post_id);
        $BackupManager = new BackupManager($Storage);
        $backups = $BackupManager->queryBackup($post_id);


        $return = (!empty($backups)) ? unserialize($backups->value) : array();
        $this->backupData = $return;

        wp_send_json($return);
    }

    public function heartbeatReceive($response, $data)
    {
        if (isset($data['kbBackupWatcher']) && $data['kbBackupWatcher'] != NULL) {

            $Storage = \Kontentblocks\Helper\getStorage($data['post_id']);


            if ($data['kbBackupWatcher'] == $Storage->getDataHandler()->get('kb_last_backup')) {
                $response['kbHasNewBackups'] = false;
            } else {

                $BackupManager = new BackupManager($Storage);
                $backups = $BackupManager->queryBackup($data['post_id']);

                $response['kbHasNewBackups'] = (!empty($backups)) ? unserialize($backups->value) : array();
            }
        }


        return $response;
    }

}

new Backup_Inspect();