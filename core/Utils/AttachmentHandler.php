<?php

namespace Kontentblocks\Utils;

class AttachmentHandler
{
    protected $image;


    public function __construct($id){
        
        if (!isset($id)){
            throw new Exception('Attachment ID must be provided');
        }
        $this->image = wp_prepare_attachment_for_js(absint($id));
    }
    
    public function getSize($size = 'thumbnail'){
        if (isset($this->image['sizes'][$size])){
            return $this->image['sizes'][$size]['url'];
        } else {
            return $this->image['sizes']['full']['url'];
        }
    }
}