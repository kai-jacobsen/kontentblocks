<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetModuleBackendForm
 * retrieves the html for a modules input form
 * used for the frontend edit modal
 */
class GetModuleBackendForm extends AbstractAjaxAction
{
    static $nonce = 'kb-read';


    /**
     * @param Request $request
     */
    protected static function action(Request $request)
    {

        if (!defined('KB_MODULE_FORM')) {
            define('KB_MODULE_FORM', true);
        }

        $moduleDef = $request->request->filter('module', array(), FILTER_DEFAULT);
        $environment = Utilities::getPostEnvironment($moduleDef['parentObjectId']);
        $workshop = new ModuleWorkshop($environment, $moduleDef);
        /** @var \Kontentblocks\Modules\Module $module */
        $module = $workshop->getModule();
//        $module->properties->viewfile = filter_var( $moduleDef['viewfile'], FILTER_SANITIZE_STRING );
        $module = apply_filters('kb.module.before.factory', $module);
        $module->setupFields();
//        $currentData = wp_unslash( $request->getFiltered( 'entityData', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY ) );
//        $oldData = $module->model->export();

//        $merged = Utilities::arrayMergeRecursive( $currentData, $oldData );

//        $module->updateModuleData( $merged );
        $html = $module->renderForm();
        $return = array(
            'html' => $html,
            'json' => Kontentblocks::getService('utility.jsontransport')->getJSON(),
        );
        new AjaxSuccessResponse('serving backend module form', $return);
    }
}