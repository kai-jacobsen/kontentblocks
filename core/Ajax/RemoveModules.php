<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Post\PostMetaDataHandler,
    Kontentblocks\Utils\GlobalDataHandler;

class RemoveModules
{

    protected $postId;
    protected $module;
    protected $dataHandler;

    public function __construct()
    {
        check_ajax_referer('kb-delete');


        $this->postId      = $_POST[ 'post_id' ];
        $this->module = $_POST[ 'module' ];
        $this->Storage = \Kontentblocks\Helper\getStorage($this->postId);

        $this->remove();
    }

    public function _setupDataHandler()
    {
        if ( $this->postId == -1 ) {
            return new GlobalDataHandler();
        } else {
            return new PostMetaDataHandler($this->postId);
        }

    }

    public function remove()
    {
        $update = $this->Storage->removeFromIndex($this->module);
        wp_send_json($update);
    }

}
