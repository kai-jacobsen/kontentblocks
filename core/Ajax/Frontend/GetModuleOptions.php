<?php

namespace Kontentblocks\Ajax\Frontend;

class GetModuleOptions
{

    public function __construct()
    {

        check_ajax_referer( 'kb-read' );

        $module = $_POST[ 'module' ];
        $Environment = new \Kontentblocks\Backend\Post\PostEnvironment($module['post_id']);
        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $module['class'], $module, $Environment, $module['moduleData'] );
        $instance    = $Factory->getModule();


        ob_start();
        $instance->options( $instance->moduleData );
        $html = ob_get_clean();

        echo stripslashes_deep( $html );
        exit;

    }

}
