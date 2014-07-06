<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Storage\PostMetaModuleStorage;

class SortModules
{

    public function __construct()
    {
        // check nonce
        check_ajax_referer('kb-update');

        // bail if essentials are missing
        if (!isset($_POST['data']) || !is_array($_POST['data']))
            wp_send_json_error('No valid data sent');

        // setup properties
        $postId = $_POST['post_id'];
        $data = $_POST['data'];
        $Storage = new PostMetaModuleStorage($postId);
        $old = $Storage->getIndex();

        // action
        $new = array();
        foreach ($data as $area => $string) {

            parse_str($string, $result);

            foreach ($result as $k => $v) {
                foreach ($old as $id => $module) {
                    if ($id === $k) {
                        unset($old[$k]);
                    }

                    if ($module['area'] === $area && $module['instance_id'] === $k):
                        $new[$module['instance_id']] = $module;
                    endif;
                }
            }
        }

        $save = array_merge($old, $new);
        $update = $Storage->saveIndex($save);

        if ($update) {
            wp_send_json($update);
        } else {
            wp_send_json_error();
        }

    }


}
