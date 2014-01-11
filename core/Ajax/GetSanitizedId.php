<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Areas\AreaRegistry;

class GetSanitizedId
{

    protected $postId;
    protected $dataHandler;
    protected $instanceId;

    public function __construct()
    {
        // verify action
        check_ajax_referer('kb-read');

        $value = filter_var($_POST['inputvalue'], FILTER_SANITIZE_STRING);

        $check = AreaRegistry::getInstance()->areaExists(trim($value));

        if (!$check){
            wp_send_json(sanitize_title($value));
        } else {
            wp_send_json_error();
        }


    }

}
