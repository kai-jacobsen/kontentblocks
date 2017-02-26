<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\BackupDataStorage2;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class BatchRemoveModules
 */
class BatchRemoveModules extends AbstractAjaxAction
{
    static $nonce = 'kb-delete';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        $postId = $request->request->getInt('postId', null);
        $environment = Utilities::getPostEnvironment($postId);
        $storage = $environment->getStorage();
        $mids = $request->request->filter('modules', null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);

        $backupManager = new BackupDataStorage2($environment);
        $backupManager->insertBackup("Before batch removal of modules");

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
