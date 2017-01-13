<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Backend\Renderer\DynamicAreaBackendRenderer;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetGlobalAreaHTML
 * Runs when area status change
 */
class GetGlobalAreaHTML extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     */
    protected static function action(Request $request)
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
