<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ChangeArea
 * Runs when module was dragged into different/new area
 * and stores the new area to the module
 *
 */
class ChangeArea extends AbstractAjaxAction
{

    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function action(Request $request)
    {
        $postID = $request->request->getInt('postId', null);
        $newArea = $request->request->filter('area_id', null, FILTER_SANITIZE_STRING);
        $newAreaContext = $request->request->filter('context', null, FILTER_SANITIZE_STRING);
        $instanceId = $request->request->filter('mid', null, FILTER_SANITIZE_STRING);
        $storage = new ModuleStorage($postID);
        $moduleDefinition = $storage->getModuleDefinition($instanceId);
        $moduleDefinition['area'] = $newArea;
        $moduleDefinition['areaContext'] = $newAreaContext;
        $update = $storage->addToIndex($instanceId, $moduleDefinition);
        if ($update) {
            return new AjaxSuccessResponse('Area changed', array('update' => $update));
        } else {
            return new AjaxErrorResponse('AddToIndex failed to update', array('update' => $update));
        }
    }
}