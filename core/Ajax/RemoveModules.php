<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\MetaData,
    Kontentblocks\Utils\GlobalData;

class RemoveModules
{

    protected $postId;
    protected $instance_id;
    protected $dataHandler;

    public function __construct()
    {
        $this->postId      = $_POST[ 'post_id' ];
        $this->instance_id = $_POST[ 'block_id' ];
        $this->dataHandler = $this->_setupDataHandler();
        
        $this->remove();
    }

    public function _setupDataHandler()
    {
        if ( $this->postId == -1 ) {
            return new GlobalData();
        } else {
            return new MetaData($this->postId);
        }

    }

    public function remove()
    {
        $update = $this->dataHandler->removeFromIndex($this->instance_id);
        wp_send_json($update);
    }

}
