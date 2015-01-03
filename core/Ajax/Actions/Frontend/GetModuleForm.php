<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleFactory;
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

        if (is_null($module)){
            wp_send_json_error('module is null');
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

        $module = apply_filters( 'kb.module.before.factory', $module );
        /** @var Environment $Environment */
        $Environment = Utilities::getEnvironment( $module['post_id'] );
        $Factory = new ModuleFactory( $module['class'], $module, $Environment, $moduleData );
        $instance = $Factory->getModule();

        $html = $instance->form();
        $return = array(
            'html' => stripslashes_deep( $html ),
            'json' => stripslashes_deep( Kontentblocks::getService('utility.jsontransport')->getJSON() )
        );
        wp_send_json( $return );
    }

}
