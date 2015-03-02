<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\ImageResize;

/**
 * Class FieldGetImage
 * Gets an resized version of the provided image attachment id
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class FieldGetImage
{
    static $nonce = 'kb-read';

    /**
     * @param ValueStorageInterface $Request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {
        $args = $Request->get( 'args' );
        $width = ( !isset( $args['width'] ) ) ? 150 : $args['width'];
        $height = ( !isset( $args['height'] ) ) ? null : $args['height'];
        $upscale = filter_var( $args['upscale'], FILTER_VALIDATE_BOOLEAN );
        $attachmentid = $Request->getFiltered( 'id', FILTER_SANITIZE_NUMBER_INT );


        return new AjaxSuccessResponse(
            'Image resized', array(
                'src' => ImageResize::getInstance()->process(
                    $attachmentid,
                    $width,
                    $height,
                    $args['crop'],
                    true,
                    $upscale
                )
            )
        );
    }
}
