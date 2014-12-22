<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

/**
 * Class ApplyContentFilter
 * @package Kontentblocks\Ajax\Frontend
 */
class ApplyContentFilter
{
    public static function run()
    {
        check_ajax_referer('kb-read');

        global $post;
        $content = filter_input(INPUT_POST, 'data', FILTER_UNSAFE_RAW);
        $module = $_POST['module'];

        $post = get_post($module['post_id']);
        setup_postdata($post);
        echo apply_filters('the_content', $content);
        exit;
    }
}
