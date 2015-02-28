<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Utils\ImageResize;

/**
 * Class FieldGetImage
 * Gets an resized version of the provided image attachment id
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class FieldGetImage
{
    /**
     *
     */
    public static function run()
    {
        $args = $_GET['args'];
        $width = ( !isset( $args['width'] ) ) ? 150 : $args['width'];
        $height = ( !isset( $args['height'] ) ) ? null : $args['height'];
        $upscale = filter_var( $args['upscale'], FILTER_VALIDATE_BOOLEAN );

        $attachmentid = filter_input( INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT );

        wp_send_json(
            ImageResize::getInstance()->process( $attachmentid, $width, $height, $args['crop'], true, $upscale )
        );
    }
}
