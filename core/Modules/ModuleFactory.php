<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Modules\Module;

class ModuleFactory
{

    protected $args;

    public function __construct( $moduleArgs )
    {
        if ( !isset( $moduleArgs ) or !isset( $moduleArgs[ 'class' ] ) ) {
            throw new \Exception( 'This is not a valid Module' );
        }
        $this->args = $moduleArgs;
        return $this;

    }

    public function getModule( )
    {

        $moduleArgs = $this->args;
        $module     = apply_filters( 'kb_modify_block', $moduleArgs );
        $module     = apply_filters( "kb_modify_block_{$moduleArgs[ 'id' ]}", $moduleArgs );
        // new instance
        $instance   = new $module[ 'class' ]( $module );
        return $instance;

    }

}
