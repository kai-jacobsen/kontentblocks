<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class BatchRemoveModules
 *
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Actions
 */
class BatchRemoveModules implements AjaxActionInterface
{
    static $nonce = 'kb-delete';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run(Request $request)
    {
        $postId = $request->request->getInt('postId', null);
        $environment = Utilities::getPostEnvironment($postId);
        $storage = $environment->getStorage();
        $mids = $request->request->filter('modules', null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        $backupManager = new BackupDataStorage($storage);
        $backupManager->backup("Before batch removal of modules");
        $responseMap = array();
        $moduleRepository = $environment->getModuleRepository();
        foreach ($mids as $mid) {
            $module = $moduleRepository->getModuleObject($mid);
            if ($module) {
                $update = $storage->removeFromIndex($mid);
                if ($update) {
                    do_action('kb.module.delete', $module);
                    Utilities::remoteConcatGet($postId);

                    $responseMap[$mid] = true;
                } else {
                    $responseMap[$mid] = false;
                }
            }
        }

        return new AjaxSuccessResponse(
            'Module successfully removed', array(
                'modules' => $responseMap
            )
        );

    }


}
