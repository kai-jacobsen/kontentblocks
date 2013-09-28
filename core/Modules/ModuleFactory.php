<?php

namespace Kontentblocks\Modules;

class ModuleFactory
{

    protected $args;

    public function __construct( $moduleArgs )
    {
        if (  !isset( $moduleArgs ) or !isset($moduleArgs['class']) ) {
            throw new \Exception( 'This is not a valid Module' );
        }

        $this->args = $moduleArgs;
        return $this;
            
    }

    public function getModule( )
    {

        $moduleArgs = $this->args;
        
        $defaults = array(
            'id' => 'generic_id',
            'instance_id' => null,
            'area' => 'kontentblocks',
            'class' => null,
            'name' => null,
            'status' => 'kb_active',
            'draft' => 'pain',
            'locked' => false,
            'area_context' => 'normal',
            'meta' => array()
        );

            $parsedArgs = wp_parse_args( $moduleArgs, $defaults );

            $module = apply_filters( 'kb_modify_block', $moduleArgs );
            $module = apply_filters( "kb_modify_block_{$moduleArgs[ 'id' ]}", $moduleArgs );
            // new instance
            $instance = new $module[ 'class' ]( $module[ 'id' ], $module[ 'name' ], $module );

            $instance->set_status( $module[ 'status' ] );
            $instance->set_draft( $module ['draft' ] );
            $instance->set_area( $module[ 'area' ] );

            foreach ( $module as $k => $v ) {
            $instance->$k = $v;
        }
        return $instance;
    }

}
