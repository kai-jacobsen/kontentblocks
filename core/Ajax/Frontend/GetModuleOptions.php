<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetModuleOptions
 * @package Kontentblocks\Ajax\Frontend
 */
class GetModuleOptions
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
        $module = $_POST['module'];
        $module = apply_filters( 'kb.module.before.factory', $module );
        /** @var PostEnvironment $Environment */
        $Environment = Utilities::getEnvironment( $module['post_id'] );
        $Factory = new ModuleFactory( $module['class'], $module, $Environment );
        $instance = $Factory->getModule();
        ob_start();
        $instance->form();
        $html = ob_get_clean();
        $return = array(
            'html' => stripslashes_deep( $html ),
            'json' => stripslashes_deep( JSONBridge::getInstance()->getJSON() )
        );
        wp_send_json( $return );
    }

}
