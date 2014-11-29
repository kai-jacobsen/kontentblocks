<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\Storage\ModuleStorage;

/**
 * Class FieldGetImage
 * @package Kontentblocks\Ajax\Frontend
 */
class UndraftModule
{
    public static function run()
    {
        check_ajax_referer( 'kb-update' );

        $mid = filter_input( INPUT_POST, 'mid', FILTER_SANITIZE_STRING );
        $post_id = filter_input( INPUT_POST, 'post_id', FILTER_VALIDATE_INT );

        if (empty( $mid ) || !is_int( $post_id )) {
            wp_send_json_error( 'No valid module id passed' );
        }

        $Storage = new ModuleStorage( $post_id, null );
        $module = $Storage->getModuleDefinition( $mid );

        if (array_key_exists( 'state', $module )) {
            $module['state']['draft'] = false;
        }

        $update = $Storage->addToIndex( $mid, $module );

        wp_send_json_success();
    }
}
