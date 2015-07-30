<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Areas\DynamicAreaBackendHTML;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetGlobalAreaHTML
 * Runs when area status change
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class GetGlobalAreaHTML implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {

        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $areaId = $request->getFiltered( 'areaId', FILTER_SANITIZE_STRING );
        $settings = $request->get( 'settings' );

        $environment = Utilities::getEnvironment( $postId );
        $area = $environment->getAreaDefinition( $areaId );

        $areaSettings = new AreaSettingsModel( $area, $postId );
        $areaSettings->import( Utilities::validateBoolRecursive( $settings ) );
        $update = $areaSettings->save();
        $html = '';

        if ($areaSettings->isAttached()) {
            $node = new DynamicAreaBackendHTML( $area, $environment, $area->context );
            ob_start();
            $node->build();
            $html = ob_get_clean();
        }

        if ($update) {
            new AjaxSuccessResponse(
                'Area Settings updated', array(
                    'settings' => $areaSettings,
                    'html' => $html
                )
            );
        } else {
            new AjaxErrorResponse( 'Area Settings not updated', $areaSettings );
        }

    }
}
