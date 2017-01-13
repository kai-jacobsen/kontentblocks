<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Fields\Definitions\Image;
use Kontentblocks\Utils\ImageResize;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class FieldGetImage
 * Gets an resized version of the provided image attachment id
 */
class FieldGetImage extends AbstractAjaxAction
{
    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
        $crop = false;
        $args = $request->request->get('args');
        $width = (!isset($args['width'])) ? 150 : absint($args['width']);
        $height = (!isset($args['height'])) ? null : absint($args['height']);
        $upscale = filter_var($args['upscale'], FILTER_VALIDATE_BOOLEAN);
        $attachmentid = $request->request->getInt('id');

        if (isset($args['crop'])) {
            $crop = $args['crop'];
            if (is_numeric($crop)) {
                $crop = Image::getCropValue(absint($crop));
            }
        }

        return new AjaxSuccessResponse(
            'Image resized', array(
                'src' => ImageResize::getInstance()->process(
                    $attachmentid,
                    $width,
                    $height,
                    $crop,
                    true,
                    $upscale
                )
            )
        );
    }
}
