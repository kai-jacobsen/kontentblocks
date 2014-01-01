<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\GlobalDataHandler,
    Kontentblocks\Backend\Post\PostMetaDataBackend;

class SortModules
{

    protected $postId;
    protected $data;
    protected $old;
    protected $dataHandler;

    public function __construct()
    {

        check_ajax_referer('kb-update');


        if (!isset($_POST['data']) || !is_array($_POST['data']))
            wp_send_json_error('No valid data sent');

        $this->postId = $_POST['post_id'];
        $this->data = $_POST['data'];
        $this->Storage = \Kontentblocks\Helper\getStorage($this->postId);
        $this->old = $this->_getOldData();

        $this->resort();

    }


    public function _getOldData()
    {
        return $this->Storage->getIndex();

    }

    public function resort()
    {
        $new = array();
        foreach ($this->data as $area => $string):

            parse_str($string, $result);

            foreach ($result as $k => $v):
                foreach ($this->old as $id => $module):
                    if ($id === $k) {
                        unset($this->old[$k]);
                    }

                    if ($module['area'] === $area && $module['instance_id'] === $k):
                        $new[$module['instance_id']] = $module;
                    endif;
                endforeach;
            endforeach;
        endforeach;

        $save = array_merge($this->old, $new);
        $update = $this->Storage->saveIndex($save);
        wp_send_json($update);

    }

}
