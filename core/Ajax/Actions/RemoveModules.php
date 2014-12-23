<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

class RemoveModules
{

    public static function run( ValueStorageInterface $Request )
    {

        if (!current_user_can( 'edit_kontentblocks' )) {
            wp_send_json_error();
        }

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $module = $Request->getFiltered( 'module', FILTER_SANITIZE_STRING );
        $Storage = new ModuleStorage( $postId );

        $BackupManager = new BackupDataStorage( $Storage );
        $BackupManager->backup( "Before Module: {$module} was deleted" );
        $update = $Storage->removeFromIndex( $module );
        wp_send_json( $update );
    }


}
