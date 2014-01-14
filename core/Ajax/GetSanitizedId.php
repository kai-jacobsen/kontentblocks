<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Modules\ModuleTemplates;

class GetSanitizedId
{

    protected $postId;
    protected $dataHandler;
    protected $instanceId;

    // TODO first sanitize the input, check if other languages exits and/or template exists in non-l18n context
    public function __construct()
    {
        // verify action
        check_ajax_referer('kb-read');

        $value = filter_var($_POST['inputvalue'], FILTER_SANITIZE_STRING);
        $checkmode = filter_var($_POST['checkmode'], FILTER_SANITIZE_STRING);
        $check = true;

        switch ($checkmode) {
            case 'areas':
                $check = AreaRegistry::getInstance()->areaExists(trim($value));
            case 'templates':
                $check = ModuleTemplates::getInstance()->templateExists(trim($value));
        }

        if ($check === false) {
            wp_send_json(sanitize_title($value));
        } else {
            wp_send_json_error();
        }
    }

}
