<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\JSONBridge;

class AfterAreaChange
{

    public function __construct()
    {

        $data = $_POST;

        $Environment = new \Kontentblocks\Backend\Environment\PostEnvironment($data['post_id']);
        $Factory  = new \Kontentblocks\Modules\ModuleFactory( $data['module']['class'], $data['module'], $Environment );
        $instance = $Factory->getModule();
        ob_start();
        $instance->options( $instance->moduleData );
        $html = ob_get_clean();

	    $return = array(
		    'html' => stripslashes_deep($html),
		    'json' => stripslashes_deep( JSONBridge::getInstance()->getJSON())
	    );

        if ( empty( $html ) ) {
            wp_send_json( \Kontentblocks\Helper\noOptionsMessage() );
        }

        wp_send_json( $return );

    }

}
