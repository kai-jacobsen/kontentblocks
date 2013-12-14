<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Admin\Post\PostMetaDataHandler,
    Kontentblocks\Utils\GlobalDataHandler;

class RemoveModules
{

    protected $postId;
    protected $module;
    protected $dataHandler;

    public function __construct()
    {
        $this->postId      = $_POST[ 'post_id' ];
        $this->module = $_POST[ 'module' ];
        $this->dataHandler = $this->_setupDataHandler();

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
        $update = $this->dataHandler->removeFromIndex($this->module);
        wp_send_json($update);
    }

}
