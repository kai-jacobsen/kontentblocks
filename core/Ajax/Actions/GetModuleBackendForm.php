<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetModuleBackendForm
 * retrieves the html for a modules input form
 * used for the frontend edit modal
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class GetModuleBackendForm implements AjaxActionInterface
{
    static $nonce = 'kb-read';


    /**
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {

        if (!defined( 'KB_MODULE_FORM' )) {
            define( 'KB_MODULE_FORM', true );
        }

        $moduleDef = $request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $environment = Utilities::getEnvironment( $moduleDef['parentObjectId'] );
        $workshop = new ModuleWorkshop($environment, $moduleDef);
        /** @var \Kontentblocks\Modules\Module $module */
        $module = $workshop->getModule();
//        $module->properties->viewfile = filter_var( $moduleDef['viewfile'], FILTER_SANITIZE_STRING );
        $module = apply_filters( 'kb.module.before.factory', $module );
        $module->setupFields();

//        $currentData = wp_unslash( $request->getFiltered( 'entityData', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY ) );
//        $oldData = $module->model->export();

//        $merged = Utilities::arrayMergeRecursive( $currentData, $oldData );

//        $module->updateModuleData( $merged );
        $html = $module->renderForm();
        $return = array(
            'html' => $html,
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON()
        );
        new AjaxSuccessResponse( 'serving backend module form', $return );
    }
}