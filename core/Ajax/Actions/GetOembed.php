<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetOembed
 * @package Kontentblocks\Ajax\Actions
 */
class GetOembed implements AjaxActionInterface
{
    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    public static function run(Request $request)
    {
        $url = $request->request->filter('embedUrl', false ,FILTER_VALIDATE_URL);

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

