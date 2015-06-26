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

    public static function run( ValueStorageInterface $Request )
    {

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $areaId = $Request->getFiltered( 'areaId', FILTER_SANITIZE_STRING );
        $settings = $Request->get( 'settings' );

        $status = !filter_var( $settings['active'], FILTER_VALIDATE_BOOLEAN );

        $Environment = Utilities::getEnvironment( $postId );
        $Area = $Environment->getAreaDefinition( $areaId );

        $AreaSettings = new AreaSettingsModel( $Area, $Environment );
        $AreaSettings->set( 'active', $status );
        $update = $AreaSettings->save();

        if ($update) {
            new AjaxSuccessResponse( 'Area Settings updated', $AreaSettings );
        } else {
            new AjaxErrorResponse( 'Area Settings not updated', $AreaSettings );
        }

    }
}
