<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Admin\InterfaceDataContainer;

abstract class AbstractDataContainer implements InterfaceDataContainer
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
