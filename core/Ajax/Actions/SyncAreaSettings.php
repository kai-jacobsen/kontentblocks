<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class SyncAreaSettings
 * Runs when area status change
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class SyncAreaSettings implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * @param ValueStorageInterface $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {

        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $areaId = $request->getFiltered( 'areaId', FILTER_SANITIZE_STRING );
        $settings = $request->get( 'settings' );

        $environment = Utilities::getPostEnvironment( $postId );
        $Area = $environment->getAreaDefinition( $areaId );

        $areaSettings = new AreaSettingsModel( $Area, $postId );
        $areaSettings->import( Utilities::validateBoolRecursive( $settings ) );
        $update = $areaSettings->save();

        if ($update) {
            return new AjaxSuccessResponse( 'Area Settings updated', $areaSettings );
        } else {
            return new AjaxErrorResponse( 'Area Settings not updated', $areaSettings );
        }

    }
}
