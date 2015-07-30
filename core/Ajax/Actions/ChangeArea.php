<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class ChangeArea
 * Runs when module was dragged into different/new area
 * and stores the new area to the module
 *
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class ChangeArea implements AjaxActionInterface
{

    static $nonce = 'kb-update';

    /**
     * @param ValueStorageInterface $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {
        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        $postID = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $newArea = $request->getFiltered( 'area_id', FILTER_SANITIZE_STRING );
        $newAreaContext = $request->getFiltered( 'context', FILTER_SANITIZE_STRING );
        $instanceId = $request->getFiltered( 'mid', FILTER_SANITIZE_STRING );
        $storage = new ModuleStorage( $postID );

        $moduleDefinition = $storage->getModuleDefinition( $instanceId );
        $moduleDefinition['area'] = $newArea;
        $moduleDefinition['areaContext'] = $newAreaContext;
        $update = $storage->addToIndex( $instanceId, $moduleDefinition );

        if ($update) {
            return new AjaxSuccessResponse( 'Area changed', array( 'update' => $update ) );
        } else {
            return new AjaxErrorResponse( 'AddToIndex failed to update', array( 'update' => $update ) );
        }
    }


}