<?php

namespace Kontentblocks\Utils;

class ModuleDirectory
{

    public $modules = array();

    public function add( $classname )
    {
        if ( !isset( $this->modules[ 'classname' ] ) ) {
            $this->modules[ 'classname' ] = new $classname;
        }

    }

}
