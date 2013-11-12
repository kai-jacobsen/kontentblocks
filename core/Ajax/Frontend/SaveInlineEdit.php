<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Utils\GlobalDataHandler,
    Kontentblocks\Admin\Post\PostMetaDataHandler;

class SaveInlineEdit
{
    public function __construct()
    {   
        $data = $_POST['data'];
        $Handler = new PostMetaDataHandler($data['postId']);
        
        $old = $Handler->getModuleData('_' . $data['module']);
        
        if (!empty($data['arraykey'])){
            $old[$data['arraykey']]['key'] = $data['data'];
        } else{
            $old[$data['key']] = $data['data'];
        }
        $Handler->saveModule($data['module'], $old);
        
    }
}
