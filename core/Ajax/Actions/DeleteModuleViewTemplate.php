<?php

namespace Kontentblocks\Ajax\Actions;

use Exception;
use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\PostCloner;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Templating\Twig;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 *
 */
class DeleteModuleViewTemplate extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        $module = wp_unslash($request->request->get('module'));
        $view = wp_unslash($request->request->get('view', ''));
        $environment = Utilities::getPostEnvironment($module['postId']);
        $ModuleWorkshop = new ModuleWorkshop($environment, $module);
        $Module = $ModuleWorkshop->getModule();
        $View = $Module->getViewManager()->getViewById($view['id']);
        if (is_null($View)) {
            new AjaxErrorResponse('View was not found', [
                'view' => $View
            ]);
        }

        $id = $View->id;
        if (strpos($id, 'user.') === false) {
            new AjaxErrorResponse('You can only delete user created templates', [
            ]);
        }

        $path = trailingslashit($View->rootPath) . $View->subPath . $View->filename;
        if (!file_exists($path)) {
            new AjaxErrorResponse('Template file not found', [
                'view' => $View
            ]);
        }

        $deleted = unlink($path);

        if ($deleted === false) {
            new AjaxErrorResponse('Failed to delete', [
                'view' => $View
            ]);
        }

        $Module->getViewManager()->getFileSystem()->reloadViews();
        new AjaxSuccessResponse('File deleted', [
            'views' => $Module->getViewManager()->updateViews()
        ]);
    }


}
