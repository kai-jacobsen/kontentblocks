<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceEnvironment;

abstract class AbstractEnvironment implements InterfaceEnvironment
{


    public function get( $param )
    {
        if ( isset( $this->$param ) ) {
            return $this->$param;
        }
        else {
            return false;
        }
    }
    
    
}
