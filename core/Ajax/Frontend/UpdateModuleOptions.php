<?php

namespace Kontentblocks\Ajax\Frontend;

class UpdateModuleOptions
{

    public function __construct()
    {

        $module = $_POST[ 'module' ];
        $data   = $_POST[ 'data' ];
        $parsed = array();
        parse_str( $data, $parsed );

        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $module );
        $instance = $Factory->getModule();
        $dataHandler = \Kontentblocks\Helper\getDataHandler( $module[ 'post_id' ] );
        $dataHandler->saveModule($instance->instance_id, $parsed[ $instance->instance_id ] );
        
        $instance->new_instance = $parsed[ $instance->instance_id ];
        wp_send_json( wp_kses_post($instance->module( $parsed[ $instance->instance_id ] ) ));

    }

}
