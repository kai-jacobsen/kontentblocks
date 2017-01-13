<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ChangeModuleStatus
 * Runs when module status change
 */
class ChangeModuleStatus extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function action(Request $request)
    {

        $postId = $request->request->getInt('postId');
        $mid = $request->request->filter('module', null, FILTER_SANITIZE_STRING);
        $storage = new ModuleStorage($postId);

        $moduleDefinition = $storage->getModuleDefinition($mid);
        if ($moduleDefinition) {

            // dont ask
            if ($moduleDefinition['state']['active'] != true) {
                $moduleDefinition['state']['active'] = true;
            } else {
                $moduleDefinition['state']['active'] = false;
            }

            $update = $storage->addToIndex($mid, $moduleDefinition);
            Utilities::remoteConcatGet($postId);

            return new AjaxSuccessResponse(
                'Status changed', array(
                    'update' => $update
                )
            );
        } else {
            return new AjaxErrorResponse(
                'Status change failed', array(
                    'moduleDef' => $moduleDefinition
                )
            );
        }
    }


}
