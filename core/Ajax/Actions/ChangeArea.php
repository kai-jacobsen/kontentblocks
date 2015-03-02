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
     * @param ValueStorageInterface $Request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {
        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        $postID = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $newArea = $Request->getFiltered( 'area_id', FILTER_SANITIZE_STRING );
        $newAreaContext = $Request->getFiltered( 'context', FILTER_SANITIZE_STRING );
        $instanceId = $Request->getFiltered( 'mid', FILTER_SANITIZE_STRING );
        $Storage = new ModuleStorage( $postID );

        $moduleDefinition = $Storage->getModuleDefinition( $instanceId );
        $moduleDefinition['area'] = $newArea;
        $moduleDefinition['areaContext'] = $newAreaContext;
        $update = $Storage->addToIndex( $instanceId, $moduleDefinition );

        if ($update) {
            return new AjaxSuccessResponse( 'Area changed', array( 'update' => $update ) );
        } else {
            return new AjaxErrorResponse( 'AddToIndex failed to update', array( 'update' => $update ) );
        }
    }


}