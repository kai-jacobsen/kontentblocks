<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\Utilities;

/**
 * Class RemoteGetEditor
 * Return the markup for an built-in tinymce editor instance
 * @package Kontentblocks\Ajax
 */
class RemoteGetEditor
{

    public static function run()
    {
        // check nonce
        check_ajax_referer( 'kb-read' );
        if (!current_user_can( 'edit_kontentblocks' )) {
            wp_send_json_error();
        }

        $settings                  = array();
        $settings['textarea_name'] = $_POST['editorName'];
        $media                     = filter_var( $_POST['args']['media_buttons'], FILTER_VALIDATE_BOOLEAN );
        $settings['media_buttons'] = $media;
        ob_start();
        Utilities::editor( $_POST['editorId'], $_POST['editorContent'], $_POST['editorName'], $media, $settings );
        $html = ob_get_clean();
        wp_send_json( $html );

    }

}
