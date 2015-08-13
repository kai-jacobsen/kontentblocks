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
 * Class BatchRemoveModules
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Actions
 */
class BatchRemoveModules implements AjaxActionInterface
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
        $environment = Utilities::getEnvironment( $postId );
        $storage = $environment->getStorage();
        $mids = $request->getFiltered( 'modules', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );


        $backupManager = new BackupDataStorage( $storage );
        $backupManager->backup( "Before batch removal of modules" );

        $responseMap = [ ];

        foreach ($mids as $mid) {
            $module = $environment->getModuleById( $mid );
            if ($module) {
                $update = $storage->removeFromIndex( $mid );
                if ($update) {
                    do_action( 'kb.module.delete', $module );
                    $responseMap[$mid] = true;
                } else {
                    $responseMap[$mid] = false;
                }
            }
        }

        return new AjaxSuccessResponse(
            'Module successfully removed', array(
                'modules' => $responseMap
            )
        );

    }


}
