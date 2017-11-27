<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetOembed
 */
class GetTemplateString extends AbstractAjaxAction
{
    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse|AjaxErrorResponse
     */
    protected static function action(Request $request)
    {
        $file = $request->request->get('viewfile');
        $path = $file['rootPath'] . $file['subPath'] . $file['filename'];
        $data = file_get_contents($path);

        new AjaxSuccessResponse('Template String', $data);
    }


}

