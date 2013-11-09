<?php

namespace Kontentblocks\Ajax\Frontend;

class GetModuleOptions{
    
    public function __construct()
    {
       
        $module = $_POST['module'];
        $Factory = new \Kontentblocks\Modules\ModuleFactory($module);
        $instance = $Factory->getModule();
        wp_send_json($instance->options($instance->new_instance));
    }
    
}