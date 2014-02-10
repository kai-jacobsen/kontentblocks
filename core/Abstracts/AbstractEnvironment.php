<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceEnvironment;

// TODO Outsource
abstract class AbstractEnvironment
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
