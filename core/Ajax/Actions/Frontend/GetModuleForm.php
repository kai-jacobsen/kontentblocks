<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetModuleForm
 * @package Kontentblocks\Ajax\Frontend
 */
class GetModuleForm
{

    /**
     *
     */
    public static function run()
    {

        check_ajax_referer( 'kb-read' );

        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $overloadData = filter_input( INPUT_POST, 'overloadData', FILTER_VALIDATE_BOOLEAN );
        $module = filter_input( INPUT_POST, 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY | FILTER_NULL_ON_FAILURE );

        if (is_null( $module )) {
            wp_send_json_error( 'module is null' );
        }

        if ($overloadData) {
            $moduleData = filter_input(
                INPUT_POST,
                'moduleData',
                FILTER_DEFAULT,
                FILTER_REQUIRE_ARRAY | FILTER_NULL_ON_FAILURE
            );
        } else {
            $moduleData = null;
        }

        $Environment = Utilities::getEnvironment( $module['post_id'] );
        $Module = $Environment->getModuleById( $module['mid'] );
        $Module = apply_filters( 'kb.module.before.factory', $Module );
        $html = $Module->form();
        $return = array(
            'html' =>  $html,
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );

        new AjaxSuccessResponse('serving module form', $return);
    }
}
