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
        $settings['media_buttons'] = filter_var($_POST['args']['media_buttons'], FILTER_VALIDATE_BOOLEAN);
        ob_start();
        wp_editor(stripslashes($_POST['editorContent']), $_POST['editorId'], $settings);
        $html = ob_get_clean();
        wp_send_json($html);

    }

}
