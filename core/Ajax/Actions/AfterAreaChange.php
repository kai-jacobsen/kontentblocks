<?php

namespace Kontentblocks\Actions\Ajax;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\Utilities;

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

        $post_id = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $module = filter_input( INPUT_POST, 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $Environment = Utilities::getEnvironment( $post_id );
        $Factory = new ModuleFactory( $module['class'], $module, $Environment );
        $instance = $Factory->getModule();
        ob_start();

        $instance->form();
        $html = ob_get_clean();
        $return = array(
            'html' => stripslashes_deep( $html ),
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );

        // @TODO handle empty options meaningful
//        if ( empty( $html ) ) {
//            wp_send_json( \Kontentblocks\Helper\noOptionsMessage() );
//        }
        wp_send_json( $return );
    }
}
