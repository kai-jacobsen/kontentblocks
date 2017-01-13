<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class RemoveModules
 */
class RemoveModules extends AbstractAjaxAction
{
    static $nonce = 'kb-delete';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        $postId = $request->request->getInt('postId', null);
        $mid = $request->request->filter('module', null, FILTER_SANITIZE_STRING);
        $environment = Utilities::getPostEnvironment($postId);
        $workshop = new ModuleWorkshop($environment, $environment->getStorage()->getModuleDefinition($mid));
        $module = $workshop->getModule();
        $storage = $environment->getStorage();
        $backupManager = new BackupDataStorage($storage);
        $backupManager->backup("Before Module: {$mid} was deleted");
        $update = $storage->removeFromIndex($mid);
        if ($update) {
            do_action('kb.module.delete', $module);
            Utilities::remoteConcatGet($postId);

            return new AjaxSuccessResponse(
                'Module successfully removed', array(
                    'update' => $update
                )
            );
        } else {
            return new AjaxErrorResponse(
                'Module was not deleted', array(
                    'update' => $update
                )
            );
        }

    }


}
