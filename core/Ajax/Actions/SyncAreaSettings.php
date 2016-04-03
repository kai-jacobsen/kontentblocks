<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

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
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run(Request $request)
    {

        $postId = $request->request->getInt('postId', null);
        $areaId = $request->request->filter('areaId', null, FILTER_SANITIZE_STRING);
        $settings = $request->request->get('settings');
        $environment = Utilities::getPostEnvironment($postId);
        $Area = $environment->getAreaDefinition($areaId);

        $areaSettings = new AreaSettingsModel($Area, $postId, DataProviderService::getPostProvider($postId));
        $areaSettings->import(Utilities::validateBoolRecursive($settings));
        $update = $areaSettings->save();

        if ($update) {
            return new AjaxSuccessResponse('Area Settings updated', $areaSettings);
        } else {
            return new AjaxErrorResponse('Area Settings not updated', $areaSettings);
        }

    }
}
