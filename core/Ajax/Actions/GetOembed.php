<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetOembed
 */
class GetOembed extends AbstractAjaxAction
{
    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse|AjaxErrorResponse
     */
    protected static function action(Request $request)
    {
        $url = $request->request->filter('embedUrl', false, FILTER_VALIDATE_URL);

        if ($url !== false) {
            $embed = wp_oembed_get($url);
            if ($embed) {
                return new AjaxSuccessResponse('Embed provider found', array(
                    'html' => $embed
                ));
            }
        }
        return new AjaxErrorResponse('No Provider found',
            array('html' => 'No Provider found or html could not be generated.'));
    }


}

