<?php

namespace Kontentblocks\Extensions;
use Kontentblocks\Utils\MetaData;

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


    }

    public function meta_box_controls()
    {
        echo "<div id='backup-inspect'></div>";

    }

    public function add_default_post_type_support()
    {
        add_post_type_support( 'page', 'backup-inspect' );

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

        $Meta = new MetaData( $post_id );
        $Meta->backup( 'Before restoring backup from:' . date( 'h:j:s', $id ) );
        $Meta->delete();
        return $Meta->restoreBackup( $id );

    }

    public function get_backups()
    {
        $post_id = $_REQUEST[ 'post_id' ];

        $Meta = new MetaData( $post_id );
        wp_send_json( $Meta->getBackups() );

    }

}

new Backup_Inspect();