<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;

class GetOembed implements AjaxActionInterface
{
    static $nonce = 'kb-read';

    /**
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run(ValueStorageInterface $request)
    {
        $url = $request->getFiltered('embedUrl', FILTER_VALIDATE_URL);

        if ($url !== false) {
            $embed = wp_oembed_get($url);
            if ($embed) {
                return new AjaxSuccessResponse('Embed provider found', array(
                    'html' => $embed
                ));
            }
            return new AjaxErrorResponse('No Provider found',
                array('html' => 'No Provider found or html could not be generated.'));
        }

    }


}

