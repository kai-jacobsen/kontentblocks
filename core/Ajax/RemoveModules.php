<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\API\PostMetaAPI;
use Kontentblocks\Backend\Storage\BackupManager;

class RemoveModules
{

    public static function run()
    {
        check_ajax_referer( 'kb-delete' );

        if (!current_user_can('edit_kontentblocks')){
            wp_send_json_error();
        }

        $postId  = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $module  = filter_input( INPUT_POST, 'module', FILTER_SANITIZE_STRING );
        $Storage = \Kontentblocks\Helper\getStorage( $postId );

        $BackupManager = new BackupManager( $Storage );
        $BackupManager->backup( "Before Module: {$module} was deleted" );
        $update = $Storage->removeFromIndex( $module );
        wp_send_json( $update );
    }


}
