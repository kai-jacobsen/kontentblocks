<?php

namespace Kontentblocks\Ajax;

/**
 * Class ChangeModuleStatus
 * Runs when module status change
 * @package Kontentblocks\Ajax
 */
class ChangeModuleStatus
{

    public static function run()
    {
        check_ajax_referer( 'kb-update' );

        $postId      = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $instance_id = filter_input( INPUT_POST, 'module', FILTER_SANITIZE_STRING );
        $Storage     = \Kontentblocks\Helper\getStorage( $postId );

        $moduleDefinition = $Storage->getModuleDefinition( $instance_id );
        if ($moduleDefinition) {

            // dont ask
            if ($moduleDefinition['state']['active'] != true) {
                $moduleDefinition['state']['active'] = true;
            } else {
                $moduleDefinition['state']['active'] = false;
            }

            $update = $Storage->addToIndex( $instance_id, $moduleDefinition );
            wp_send_json( $update );
        }

    }


}
