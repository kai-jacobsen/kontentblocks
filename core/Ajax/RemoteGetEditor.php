<?php

namespace Kontentblocks\Ajax;

class RemoteGetEditor
{

    public function __construct()
    {
        // check nonce
        check_ajax_referer('kb-read');

        ob_start();
        wp_editor(stripslashes_deep($_POST['editorContent']), $_POST['editorId'], array('textarea_name' => $_POST['editorName']));
        $html = ob_get_clean();
        wp_send_json($html);

    }

}
