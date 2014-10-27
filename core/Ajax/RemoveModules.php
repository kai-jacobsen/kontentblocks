<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\DataProvider\DataHandler;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Backend\Storage\PostMetaModuleStorage;

class RemoveModules
{

    public static function run()
    {
        check_ajax_referer( 'kb-delete' );

        if (!current_user_can( 'edit_kontentblocks' )) {
            wp_send_json_error();
        }

        $postId  = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $module  = filter_input( INPUT_POST, 'module', FILTER_SANITIZE_STRING );
        $Storage = new PostMetaModuleStorage( $postId );

        $BackupManager = new BackupDataStorage( $Storage );
        $BackupManager->backup( "Before Module: {$module} was deleted" );
        $update = $Storage->removeFromIndex( $module );

        wp_send_json( $update );
    }


}
