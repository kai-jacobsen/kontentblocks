<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\GlobalDataHandler,
    Kontentblocks\Admin\Post\PostMetaDataHandler;

class ChangeModuleStatus
{

    protected $postId;
    protected $instance_id;
    protected $dataHandler;

    public function __construct()
    {

        $this->postId      = $_POST[ 'post_id' ];
        $this->instance_id = $_POST[ 'module' ];
        $this->dataHandler = $this->_setupDataHandler();

        $this->changeStatus();
        
    }

    public function _setupDataHandler()
    {
        if ( $this->postId == -1 ) {
            return new GlobalDataHandler();
        }
        else {
            return new PostMetaDataHandler($this->postId);
        }

    }

    public function changeStatus()
    {
        
        $moduleDefinition = $this->dataHandler->getModuleDefinition($this->instance_id);
        
        if ($moduleDefinition){
            
            if ($moduleDefinition['settings']['active'] != true){
                $moduleDefinition['settings']['active'] = true;
            } else {
                $moduleDefinition['settings']['active'] = false;
            }
            
            $update = $this->dataHandler->addToIndex($this->instance_id, $moduleDefinition);
            wp_send_json($update);
        }
        
        
    }

}
