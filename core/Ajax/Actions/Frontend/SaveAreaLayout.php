<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Areas\AreaSettingsModel;

/**
 * Class SaveAreaLayout
 * @package Kontentblocks\Ajax\Frontend
 */
class SaveAreaLayout
{
    /**
     *
     */
    public static function run()
    {
        check_ajax_referer( 'kb-update' );
        $area = $_POST['area'];
        $postId = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $layout = filter_input( INPUT_POST, 'layout', FILTER_SANITIZE_STRING );
        $settings = new AreaSettingsModel( $postId );

        if ($settings->getLayout( $area['id'] ) === $layout) {
            wp_send_json(
                array(
                    'status' => 200,
                    'response' => 'Layout has not changed'
                )
            );
        }

        $settings->setLayout( $area['id'], $layout )->save();

        wp_send_json(
            array(
                'status' => 200,
                'response' => 'Layout saved'
            )
        );
    }
}
