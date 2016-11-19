<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Backend\Storage\ModuleStorage;

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
        add_action( 'add_meta_boxes', array( $this, 'addMetaBox' ), 15, 2 );
        add_action( 'wp_ajax_get_backups', array( $this, 'getBackups' ) );
        add_action( 'init', array( $this, 'observeQuery' ),99 );
        add_filter( 'heartbeat_received', array( $this, 'heartbeatReceive' ), 10, 2 );
    }

    /**
     * Add Backup list meta box to enabled post types
     */
    public function addMetaBox()
    {
        $screen = get_current_screen();

        if (post_type_supports( $screen->post_type, 'kontentblocks:backups-ui' )) {
            add_meta_box(
                'kb-backup-inspect',
                'Kontenblocks Backup',
                array( $this, 'controls' ),
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
        if (isset( $_GET['restore_backup'] )) {
            $location = add_query_arg( array( 'restore_backup' => false, 'post_id' => false ) );
            $this->restoreBackup( $_GET['post_id'], $_GET['restore_backup'] );
            wp_redirect( $location );
            exit;
        }

    }

    /**
     * restore a backup
     *
     * @param $post_id int post id
     * @param $id string id of target backup (a timestamp most likely)
     */
    public function restoreBackup( $post_id, $id )
    {

        $storage = new ModuleStorage( $post_id );
        $backupManager = new BackupDataStorage( $storage );
        $backupManager->backup( 'before backup restore' );
        $backupManager->restoreBackup( $id );

    }

    /**
     * Ajax callback to get a list of all backups for a post
     */
    public function getBackups()
    {
        check_ajax_referer( 'kb-read' );

        $postId = $_REQUEST['post_id'];

        $storage = new ModuleStorage( $postId );
        $backupManager = new BackupDataStorage( $storage );
        $backups = $backupManager->queryBackup( $postId );
        $return = ( !empty( $backups ) ) ? unserialize( base64_decode( $backups->value ) ) : array();
        $this->backupData = $return;
        wp_send_json( $return );
    }

    /**
     * Checks if new backups were created and sends the new list if new backups were found
     *
     * @param $response array
     * @param $data array
     *
     * @return mixed
     */
    public function heartbeatReceive( $response, $data )
    {
        if (isset( $data['kbBackupWatcher'] ) && $data['kbBackupWatcher'] != null) {

            $storage = new ModuleStorage( $data['post_id'] );

            if ($data['kbBackupWatcher'] == get_post_meta( $data['post_id'], 'kb_last_backup', true )) {
                $response['kbHasNewBackups'] = false;
            } else {
                $backupManager = new BackupDataStorage( $storage );
                $backups = $backupManager->queryBackup( $data['post_id'] );
                $response['hmm'] = update_post_meta( $data['post_id'], 'kb_last_backup', $data['kbBackupWatcher'] );
                $response['kbHasNewBackups'] = ( !empty( $backups ) ) ? unserialize(
                    base64_decode( $backups->value )
                ) : array();
            }
        }
        return $response;
    }

}
