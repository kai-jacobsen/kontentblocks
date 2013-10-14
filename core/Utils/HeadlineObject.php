<?php

namespace Kontentblocks\Utils;

class HeadlineObject
{
    
    
    protected $value;
    protected $module;
    
    public function __construct($value, $module){
        $this->value = $value;
        $this->Module = $module;
    }
    
    public function getTag($tag = 'h3'){
        return "<" . $tag . " data-rel='headline'>" . $this->value . "</" . $tag . ">";
    }
    
}