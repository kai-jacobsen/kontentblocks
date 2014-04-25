<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Utils\JSONBridge;

class GetModuleOptions
{

    public function __construct()
    {

        check_ajax_referer( 'kb-read' );

        if (!defined('KB_ONSITE_ACTIVE')){
            define('KB_ONSITE_ACTIVE', true);
        }

        $module = $_POST[ 'module' ];
        $Environment = \Kontentblocks\Helper\getEnvironment($module['post_id']);

        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $module['class'], $module, $Environment, $module['moduleData'] );
        $instance    = $Factory->getModule();

        ob_start();
        $instance->options( $instance->moduleData );
        $html = ob_get_clean();

        $return = array(
            'html' => stripslashes_deep($html),
            'json' => JSONBridge::getInstance()->getJSON()
        );

//        echo stripslashes_deep( $html );
        wp_send_json($return);
        exit;
    }

}
