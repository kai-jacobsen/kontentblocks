<?php

namespace Kontentblocks\Plugins;

class Backup_Inspect
{

    public function __construct()
    {
        add_action( 'init', array( $this, 'add_default_post_type_support' ) );
        add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ), 15, 2 );
        add_action( 'wp_ajax_get_backups', array( $this, 'get_backups' ) );
        add_action( 'init', array( $this, 'observe_query' ) );

    }

    public function add_meta_box()
    {
        $screen = get_current_screen();

        if ( post_type_supports( $screen->post_type, 'backup-inspect' ) ) {
            add_meta_box( 'kb-backup-inspect', 'Backup Inspect', array( $this, 'meta_box_controls' ), $screen->post_type, 'side', 'high' );
        }

        add_action( 'admin_print_scripts', array( $this, 'print_scripts' ) );

    }

    public function meta_box_controls()
    {
        echo "<div id='backup-inspect'></div>";

    }

    public function add_default_post_type_support()
    {
        add_post_type_support( 'page', 'backup-inspect' );

    }

    public function print_scripts()
    {
        wp_enqueue_script( 'backup-inspect', KB_PLUGIN_URL . '/js/BackupInspect.js', array( 'backbone', 'underscore', 'kb_plugins' ), null, true );

    }

    public function observe_query()
    {
        if ( isset( $_GET[ 'restore_backup' ] ) ) {

            $location = add_query_arg( array( 'restore_backup' => false, 'post_id' => false ) );
            $this->restore_backup( $_GET[ 'post_id' ], $_GET[ 'restore_backup' ] );
            wp_redirect($location);
        }

    }

    public function restore_backup( $post_id, $id )
    {

        $Meta = new \KB_Post_Meta( $post_id );
        $Meta->backup( 'Before restoring backup from:' . date( 'h:j:s', $id ) );
        $Meta->delete();
        return $Meta->restoreBackup( $id );

    }

    public function get_backups()
    {
        $post_id = $_REQUEST[ 'post_id' ];

        $Meta = new \KB_Post_Meta( $post_id );
        wp_send_json( $Meta->get_backups() );

    }

}

new Backup_Inspect();