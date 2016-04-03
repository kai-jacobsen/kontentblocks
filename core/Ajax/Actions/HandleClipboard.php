<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class HandleClipboard
 *
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class HandleClipboard implements AjaxActionInterface
{

    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run(Request $request)
    {
        $delete = false;
        $data = $request->request->get('data');
        $target = filter_var($data['targetPid'], FILTER_SANITIZE_NUMBER_INT);
        $source = filter_var($data['sourcePid'], FILTER_SANITIZE_NUMBER_INT);
        $mode = filter_var($data['mode'], FILTER_SANITIZE_STRING);
        $mid = filter_var($data['mid'], FILTER_SANITIZE_STRING);

        $sourceEnv = Utilities::getPostEnvironment($source);
        $targetEnv = Utilities::getPostEnvironment($target);

        $sourceModule = $sourceEnv->getStorage()->getModuleDefinition($mid);
        $workshop = new ModuleWorkshop(
            $targetEnv, [
            'postId' => $targetEnv->getId(),
            'parentObjectId' => $targetEnv->getId()
        ], $sourceModule
        );
        $update = $targetEnv->getStorage()->addToIndex(
            $workshop->getNewId(),
            $workshop->getDefinitionArray()
        );

        if ($update) {
            $originalData = $sourceEnv->getStorage()->getModuleData($mid);
            $targetEnv->getStorage()->saveModule($workshop->getPropertiesObject()->mid, $originalData);
            $targetEnv->getStorage()->reset();
            $module = $workshop->getModule();

            if ($mode === 'move') {
                $delete = $sourceEnv->getStorage()->removeFromIndex($mid);
            }

            apply_filters('kb.module.before.factory', $module);
            $html = $module->renderForm();
            $response = array
            (
                'id' => $workshop->getPropertiesObject()->mid,
                'module' => $module->toJSON(),
                'name' => $module->properties->getSetting('publicName'),
                'html' => $html,
                'json' => Kontentblocks()->getService('utility.jsontransport')->getJSON(),
                'delete' => $delete

            );
            return new AjaxSuccessResponse('Module successfully copied from clipboard', $response);
        } else {
            return new AjaxErrorResponse('Clipboard action failed');
        }
    }


}