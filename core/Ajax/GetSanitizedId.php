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
        check_ajax_referer('kb-read');


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

        $posts = get_posts(array(
            'post_type' => 'kb-dyar',
            'posts_per_page' => 1,
            'name' => $sane,
            'suppress_filters' => false
        ));

        if (!empty($posts)) {
            return 'translate';
        }

        return str_replace('-', '_', $sane);

    }

    private function checkTemplateExists($ad)
    {
        $sane = sanitize_title($ad);

        $posts = get_posts(array(
            'post_type' => 'kb-mdtpl',
            'posts_per_page' => 1,
            'name' => $sane,
            'suppress_filters' => false
        ));

        if (!empty($posts)) {
            return 'translate';
        }

        return str_replace('-', '_', $sane);

    }

}
