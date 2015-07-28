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
     * @param ValueStorageInterface $Request
     */
    public static function run( ValueStorageInterface $Request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }

        if (!defined( 'KB_MODULE_FORM' )) {
            define( 'KB_MODULE_FORM', true );
        }

        $module = $Request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );

        $Environment = Utilities::getEnvironment( $module['parentObjectId'] );
        $Module = $Environment->getModuleById( $module['mid'] );
        $Module->Properties->viewfile = filter_var( $module['viewfile'], FILTER_SANITIZE_STRING );
        $Module = apply_filters( 'kb.module.before.factory', $Module );
        $Module->setupFields();

        $currentData = wp_unslash( $Request->getFiltered( 'moduleData', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY ) );
        $oldData = $Module->Model->export();

        $merged = Utilities::arrayMergeRecursive( $currentData, $oldData );

        $Module->setModuleData( $merged );
        $html = $Module->form();
        $return = array(
            'html' => $html,
//            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON()
        );
        new AjaxSuccessResponse( 'serving module form', $return );
    }
}
