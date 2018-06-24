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
class UpdateModuleViewTemplate extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        $view = wp_unslash($request->request->get('view', null));
        $module = wp_unslash($request->request->get('module'));
        $string = wp_unslash($request->request->get('tplstring', ''));
        $environment = Utilities::getPostEnvironment($module['postId']);
        $ModuleWorkshop = new ModuleWorkshop($environment, $module);
        $Module = $ModuleWorkshop->getModule();

        $View = $Module->getViewManager()->getViewById($view['id']);

        try {
            $twig = Kontentblocks::getService('templating.twig.public')->createTemplate($string);
            Twig::setPath($Module->properties->getSetting('path'));
            $twig->render([]);
        } catch (Exception $e) {
            new AjaxErrorResponse($e->getMessage(), ['string' => $string]);
        }

        file_put_contents($View->getNode()->getRealPath(), $string);

        new AjaxSuccessResponse('successfully updated', [
            'view' => $view,
            'module' => $Module->toJSON()
        ]);

    }

}
