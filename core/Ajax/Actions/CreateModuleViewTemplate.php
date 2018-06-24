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
class CreateModuleViewTemplate extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        $module = wp_unslash($request->request->get('module'));
        $tplName = wp_unslash($request->request->get('filename', ''));
        $environment = Utilities::getPostEnvironment($module['postId']);
        $ModuleWorkshop = new ModuleWorkshop($environment, $module);
        $Module = $ModuleWorkshop->getModule();
        $View = $Module->getViewManager()->getViewByName($tplName);
        $ext = pathinfo($tplName, PATHINFO_EXTENSION);
        $string = wp_unslash($request->request->get('tplstring', ''));

        if ($ext !== 'twig') {
            new AjaxErrorResponse('The filename must include the .twig extension', [
                'filename' => $tplName,
                'view' => $View
            ]);
        }

        if (!is_null($View)) {
            $Module->getViewManager()->getFileSystem()->reloadViews();
            new AjaxErrorResponse('A template with that name already exists', [
                'filename' => $tplName,
                'view' => $View,
                'views' => $Module->getViewManager()->updateViews()

            ]);
        }


        $path = self::buildPath($module);

        if (file_exists(trailingslashit($path) . $tplName)) {
            $Module->getViewManager()->getFileSystem()->reloadViews();
            new AjaxErrorResponse('This custom template already exists', [
                'views' => $Module->getViewManager()->updateViews()
            ]);
        }

        $fcreate = file_put_contents($path . $tplName, $string);
        if ($fcreate === false) {
            new AjaxErrorResponse('Failed to create file', [
            ]);
        }

        $Module->getViewManager()->getFileSystem()->reloadViews();

        new AjaxSuccessResponse('New template was created', [
            'views' => $Module->getViewManager()->updateViews()
        ]);

    }

    private static function buildPath($module)
    {

        $uploadDir = wp_upload_dir();
        $class = $module['class'];

        $path = $uploadDir['basedir'] . DIRECTORY_SEPARATOR . 'Kontentblocks' . DIRECTORY_SEPARATOR . 'moduletemplates' . DIRECTORY_SEPARATOR . $class . DIRECTORY_SEPARATOR . 'user' . DIRECTORY_SEPARATOR;
        if (!is_dir($path)) {
            $made = wp_mkdir_p($path);
            if ($made === false) {
                new AjaxErrorResponse('Unable to create directory.', [
                ]);
            }
        }

        return $path;

    }

}
