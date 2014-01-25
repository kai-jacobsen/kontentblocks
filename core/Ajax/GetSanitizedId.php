<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\API\PluginDataAPI;
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
                $check = $this->checkAreaExists(trim($value));
                break;
            case 'templates':
                $check = $this->checkTemplateExists(trim($value));
                break;
        }

        wp_send_json($check);

    }

    private function checkAreaExists($ad)
    {
        $sane = sanitize_title($ad);
        $Storage = \Kontentblocks\Helper\getStorage($ad);
        $langs = $Storage->getDataBackend()->getLanguagesForKey($sane);
        // key exists
        if ($langs !== false) {
            return 'translate';
        }

        return $sane;
    }

    private function checkTemplateExists($ad)
    {
        $sane = sanitize_title($ad);
        $API = new PluginDataAPI('template');
        $langs = $API->getLanguagesForKey($sane);
        // key exists
        if ($langs !== false) {
            return 'translate';
        }

        return $sane;

    }

}
