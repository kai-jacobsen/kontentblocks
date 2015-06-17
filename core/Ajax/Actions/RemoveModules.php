<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\Utilities;

/**
 * Class RemoveModules
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Actions
 */
class RemoveModules implements AjaxActionInterface
{
    static $nonce = 'kb-delete';

    public static function run( ValueStorageInterface $Request )
    {

        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $mid = $Request->getFiltered( 'module', FILTER_SANITIZE_STRING );

        $Environment = Utilities::getEnvironment( $postId );
        $Module = $Environment->getModuleById( $mid );
        $Storage = $Environment->getStorage();
        $BackupManager = new BackupDataStorage( $Storage );
        $BackupManager->backup( "Before Module: {$mid} was deleted" );
        $update = $Storage->removeFromIndex( $mid );
        if ($update) {
            do_action( 'kb.module.delete', $Module );
            return new AjaxSuccessResponse(
                'Module successfully removed', array(
                    'update' => $update
                )
            );
        } else {
            return new AjaxErrorResponse(
                'Module was not deleted', array(
                    'update' => $update
                )
            );
        }

    }


}
