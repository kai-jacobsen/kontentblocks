<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Class RemoveModules
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Actions
 */
class RemoveModules implements AjaxActionInterface
{
    static $nonce = 'kb-delete';

    /**
     * @param ValueStorageInterface $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {

        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $mid = $request->getFiltered( 'module', FILTER_SANITIZE_STRING );

        $environment = Utilities::getPostEnvironment( $postId );
        $workshop = new ModuleWorkshop($environment, $environment->getStorage()->getModuleDefinition($mid));
        $module = $workshop->getModule();
        $storage = $environment->getStorage();
        $backupManager = new BackupDataStorage( $storage );
        $backupManager->backup( "Before Module: {$mid} was deleted" );
        $update = $storage->removeFromIndex( $mid );
        if ($update) {
            do_action( 'kb.module.delete', $module );
            Utilities::remoteConcatGet( $postId );

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
