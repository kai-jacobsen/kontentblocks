<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Admin\Post\PostMetaDataHandler;

class ChangeArea
{
    
    protected $postId;
    protected $dataHandler;
    protected $newArea;
    protected $instanceId;




    public function __construct()
    {
        $this->postId = $_POST['post_id'];
        $this->newArea = $_POST['area_id'];
        $this->newAreaContext = $_POST['context'];
        $this->instanceId = $_POST['block_id'];
        $this->Storage = \Kontentblocks\Helper\getStorage($this->postId);
        $this->updateArea();
        
    }

    public function updateArea()
    {
        $moduleDefinition = $this->Storage->getModuleDefinition($this->instanceId);
        
        $moduleDefinition['area'] = $this->newArea;
        $moduleDefinition['areaContext'] = $this->newAreaContext;
        $update = $this->Storage->addToIndex($this->instanceId, $moduleDefinition);
        wp_send_json($update);
    }

}