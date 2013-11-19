<?php

namespace Kontentblocks\Ajax\Frontend;

class GetModuleOptions
{

    public function __construct()
    {

        $module = $_POST[ 'module' ];

        $Environment = new \Kontentblocks\Admin\Post\PostEnvironment($module['post_id']);
        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $module, $Environment, $module['moduleData'] );
        $instance = $Factory->getModule();
        
        wp_send_json( $instance->options( $instance->moduleData ) );

    }

}
