<?php

namespace Kontentblocks\Admin;
use Kontentblocks\Utils\MetaData;


class PostContext
{
    
    protected $MetaData;
    

    public function __construct( $postid)
    {
        if (!isset($postid)){
            return false;
        }
        
        $this->MetaData = new MetaData($postid);
        
    }
    
}