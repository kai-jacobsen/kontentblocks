<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\Renderer\DynamicAreaBackendRenderer;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

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
     * @param Request $request
     */
    public static function run(Request $request)
    {

        $postId = $request->request->getInt('postId');
        $areaId = $request->request->filter('areaId', null, FILTER_SANITIZE_STRING);
        $settings = $request->request->get('settings');

        $environment = Utilities::getPostEnvironment($postId);
        $area = $environment->getAreaDefinition($areaId);

        $areaSettings = new AreaSettingsModel($area, $postId, $environment->getDataProvider());
        $areaSettings->import(Utilities::validateBoolRecursive($settings));
        $update = $areaSettings->save();
        $html = '';

        if ($areaSettings->isAttached()) {
            $node = new DynamicAreaBackendRenderer($area, $environment, $area->context);
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
            new AjaxErrorResponse('Area Settings not updated', $areaSettings);
        }

    }
}
