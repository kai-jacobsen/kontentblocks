<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceDataContainer;

abstract class AbstractContextData implements InterfaceDataContainer
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
