<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;

/**
 * Runs after a module was dragged into a different area
 * Runs after the module view select field changed
 *
 * Gets the module options form for new/changed conditions
 *
 *
 *
 * Class AfterAreaChange
 * @package Kontentblocks\Ajax
 */
class AfterAreaChange
{

    /**
     * Get going
     */
    public static function run()
    {

        check_ajax_referer( 'kb-read' );
        if (!current_user_can( 'edit_kontentblocks' )) {
            wp_send_json_error();
        }
        
        $data        = $_POST;
        $Environment = new PostEnvironment( $data['post_id'] );
        $Factory     = new ModuleFactory( $data['module']['class'], $data['module'], $Environment );
        $instance    = $Factory->getModule();
        ob_start();

        $instance->options( $instance->moduleData );
        $html   = ob_get_clean();
        $return = array(
            'html' => stripslashes_deep( $html ),
            'json' => stripslashes_deep( JSONBridge::getInstance()->getJSON() )
        );

        // @TODO handle empty options meaningful
//        if ( empty( $html ) ) {
//            wp_send_json( \Kontentblocks\Helper\noOptionsMessage() );
//        }

        wp_send_json( $return );
    }
}
