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

        $Environment = new \Kontentblocks\Admin\Post\PostEnvironment($module['post_id']);
        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $module, $Environment );
        $instance = $Factory->getModule();
        $dataHandler = \Kontentblocks\Helper\getDataHandler( $module[ 'post_id' ] );
        $dataHandler->saveModule($instance->instance_id, $parsed[ $instance->instance_id ] );
        
        $instance->moduleData = $parsed[ $instance->instance_id ];
        wp_send_json( wp_kses_post($instance->module( $parsed[ $instance->instance_id ] ) ));

    }

}
