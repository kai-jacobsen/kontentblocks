<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\EditScreens\ScreenManager;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class UpdateContextAreaOrder
 * Runs when area order inside a context changes
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class UpdateContextAreaOrder implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run(Request $request)
    {
        $postId = $request->request->getInt('postId', null);
        $data = $request->request->get('data');

        if (!is_array($data)) {
            return self::sendError($data);
        }

        $contexts = array_keys(ScreenManager::getDefaultContextLayout());
        /** @var \Kontentblocks\Areas\AreaRegistry $registry */
        $registry = Kontentblocks()->getService('registry.areas');

        foreach ($data as $context => $areas) {
            if (!in_array($context, $contexts)) {
                return self::sendError($data);
            }

            foreach (array_keys($areas) as $areaId) {
                if (!$registry->areaExists($areaId)) {
                    return self::sendError($data);
                }
            }
        }

        $environment = Utilities::getPostEnvironment($postId);
        $dataProvider = $environment->getDataProvider();
        $update = $dataProvider->update('_kbcontexts', $data);

        if ($update) {
            return new AjaxSuccessResponse('Area order updated', $data);
        } else {
            return new AjaxErrorResponse('Area order not updated. There was an error', $data);
        }

    }

    /**
     * @param $data
     * @return AjaxErrorResponse
     */
    protected static function sendError($data)
    {
        return new AjaxErrorResponse('Area order not updated. There was an error', $data);
    }
}
