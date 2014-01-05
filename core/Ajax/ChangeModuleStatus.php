<?php

namespace Kontentblocks\Ajax;

class ChangeModuleStatus
{

    protected $postId;
    protected $instance_id;
    protected $dataHandler;

    public function __construct()
    {
        check_ajax_referer('kb-update');

        $this->postId      = $_POST[ 'post_id' ];
        $this->instance_id = $_POST[ 'module' ];
        $this->Storage = \Kontentblocks\Helper\getStorage($this->postId);

        $this->changeStatus();
        
    }

    public function changeStatus()
    {
        
        $moduleDefinition = $this->Storage->getModuleDefinition($this->instance_id);
        if ($moduleDefinition){
            
            if ($moduleDefinition['state']['active'] != true){
                $moduleDefinition['state']['active'] = true;
            } else {
                $moduleDefinition['state']['active'] = false;
            }
            
            $update = $this->Storage->addToIndex($this->instance_id, $moduleDefinition);
            wp_send_json($update);
        }
        
        
    }

}
