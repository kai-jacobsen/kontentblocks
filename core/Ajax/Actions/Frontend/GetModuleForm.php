<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetModuleForm
 * retrieves the html for a modules input form
 * used for the frontend edit modal
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class GetModuleForm implements AjaxActionInterface
{
    static $nonce = 'kb-read';


    /**
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }

        if (!defined( 'KB_MODULE_FORM' )) {
            define( 'KB_MODULE_FORM', true );
        }

        $moduleDef = $request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );

        $environment = Utilities::getEnvironment( $moduleDef['parentObjectId'] );
        $module = $environment->getModuleById( $moduleDef['mid'] );
        $module->Properties->viewfile = filter_var( $moduleDef['viewfile'], FILTER_SANITIZE_STRING );
        $module = apply_filters( 'kb.module.before.factory', $module );
        $module->setupFields();

        $currentData = wp_unslash( $request->getFiltered( 'moduleData', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY ) );
        $oldData = $module->Model->export();

        $merged = Utilities::arrayMergeRecursive( $currentData, $oldData );

        $module->setModuleData( $merged );
        $html = $module->form();
        $return = array(
            'html' => $html,
//            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON()
        );
        new AjaxSuccessResponse( 'serving module form', $return );
    }
}
