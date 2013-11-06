<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\PostMetaDataHandler;

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
        $this->instanceId = $_POST['block_id'];
        $this->dataHandler = new PostMetaDataHandler($this->postId);
        $this->updateArea();
        
    }

    public function updateArea()
    {
        $moduleDefinition = $this->dataHandler->getModuleDefinition($this->instanceId);
        
        $moduleDefinition['area'] = $this->newArea;
        $update = $this->dataHandler->addToIndex($this->instanceId, $moduleDefinition);
        wp_send_json($update);
    }

}