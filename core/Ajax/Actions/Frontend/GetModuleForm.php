<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetModuleForm
 * retrieves the html for a modules input form
 * used for the frontend edit modal
 */
class GetModuleForm extends AbstractAjaxAction
{
    static $nonce = 'kb-read';


    /**
     * @param Request $request
     */
    protected static function action(Request $request)
    {
        if (!defined('KB_ONSITE_ACTIVE')) {
            define('KB_ONSITE_ACTIVE', true);
        }

        if (!defined('KB_MODULE_FORM')) {
            define('KB_MODULE_FORM', true);
        }
        $moduleDef = $request->request->filter('module', array(), FILTER_DEFAULT);
        $moduleDef = apply_filters('kb.modify.module.before.frontend.form', $moduleDef);
        $environment = Utilities::getPostEnvironment($moduleDef['parentObjectId']);
        /** @var \Kontentblocks\Modules\Module $module */
        $workshop = new ModuleWorkshop($environment,
            $environment->getStorage()->getModuleDefinition($moduleDef['mid']));
        $module = $workshop->getModule();
        $module->properties->viewfile = filter_var($moduleDef['viewfile'], FILTER_SANITIZE_STRING);
        $module = apply_filters('kb.module.before.factory', $module);
        $module->setupFields();

        $currentData = wp_unslash($request->request->filter('entityData', array(), FILTER_DEFAULT));
        $oldData = $module->model->export();
        $merged = Utilities::arrayMergeRecursive($currentData, $oldData);

        $module->updateModuleData($merged);
        $html = "<div class='kb-module--status-bar'></div>";
        $html .= $module->form();
        $return = array(
            'html' => $html,
//            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
            'json' => Kontentblocks::getService('utility.jsontransport')->getJSON()
        );
        new AjaxSuccessResponse('serving module form', $return);
    }
}
