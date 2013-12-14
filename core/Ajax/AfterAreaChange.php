<?php

namespace Kontentblocks\Ajax;

class AfterAreaChange
{

    public function __construct()
    {

        $data = $_POST;

        $Environment = new \Kontentblocks\Admin\Post\PostEnvironment($data['post_id']);
        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $data['module']['class'], $data['module'], $Environment );
        $instance = $Factory->getModule();
        ob_start();
        $instance->options( $instance->moduleData );
        $html = ob_get_clean();

        if ( empty( $html ) ) {
            wp_send_json( \Kontentblocks\Helper\noOptionsMessage() );
        }

        wp_send_json( $html );

    }

}
