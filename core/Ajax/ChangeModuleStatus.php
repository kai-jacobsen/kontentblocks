<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\GlobalData,
    Kontentblocks\Utils\MetaData;

class ChangeModuleStatus
{

    protected $postId;
    protected $instance_id;
    protected $dataHandler;

    public function __construct()
    {

        $this->postId      = $_POST[ 'post_id' ];
        $this->instance_id = $_POST[ 'block_id' ];
        $this->dataHandler = $this->_setupDataHandler();

        $this->changeStatus();
        
    }

    public function _setupDataHandler()
    {
        if ( $this->postId == -1 ) {
            return new GlobalData();
        }
        else {
            return new MetaData($this->postId);
        }

    }

    public function changeStatus()
    {
        
        $moduleDefinition = $this->dataHandler->getModuleDefinition($this->instance_id);
        
        if ($moduleDefinition){
            
            if ($moduleDefinition['status'] === 'kb_inactive'){
                $moduleDefinition['status'] = 'kb_active';
            } else {
                $moduleDefinition['status'] = 'kb_inactive';
            }
            
            $update = $this->dataHandler->addToIndex($this->instance_id, $moduleDefinition);
            wp_send_json($update);
        }
        
        
    }

}
