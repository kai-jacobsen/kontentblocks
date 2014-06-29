<?php

namespace Kontentblocks\Ajax;

class RemoteGetEditor
{

    public function __construct()
    {
        // check nonce
        check_ajax_referer('kb-read');

        $settings = array();
        $settings[ 'textarea_name'] = $_POST['editorName'];
	    $media = filter_var($_POST['args']['media_buttons'], FILTER_VALIDATE_BOOLEAN);
        $settings['media_buttons'] = $media;
        ob_start();
//        wp_editor(stripslashes($_POST['editorContent']), $_POST['editorId'], $settings);
	    kb_wp_editor($_POST['editorId'], $_POST['editorContent'], $_POST['editorName'], $media, $settings);
        $html = ob_get_clean();
        wp_send_json($html);

    }

}
