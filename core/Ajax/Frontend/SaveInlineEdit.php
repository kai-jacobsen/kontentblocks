<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\DataProvider\PostMetaDataProvider;

class SaveInlineEdit
{
    public function __construct()
    {   
        $data = $_POST['data'];
        $Handler = new PostMetaDataProvider($data['postId']);
        
        $old = $Handler->getModuleData('_' . $data['module']);
        
        if (!empty($data['arraykey'])){
            $old[$data['arraykey']]['key'] = $data['data'];
        } else{
            $old[$data['key']] = $data['data'];
        }
        $Handler->saveModule($data['module'], $old);
        
    }
}
