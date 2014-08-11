<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Utils\ImageResize;

/**
 * Class FieldGetImage
 * @package Kontentblocks\Ajax\Frontend
 */
class FieldGetImage
{
    public static function run()
    {

        $args = $_GET['args'];
        $width = ( !isset( $args['width'] ) ) ? 150 : $args['width'];
        $height = ( !isset( $args['height'] ) ) ? null : $args['height'];

        $id = filter_input( INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT );


        wp_send_json(
            ImageResize::getInstance()->process( $id, $width, $height, $args['crop'], true, $args['upscale'] )
        );
    }
}
