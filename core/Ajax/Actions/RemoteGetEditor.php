<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class RemoteGetEditor
 * Return the markup for an built-in tinymce editor instance
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class RemoteGetEditor implements AjaxActionInterface
{

    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    public static function run(Request $request)
    {

        $args = $request->request->filter('args', array(), FILTER_REQUIRE_ARRAY);
        $settings = array();
        $settings['textarea_name'] = $request->request->filter('editorName', null, FILTER_SANITIZE_STRING);
        $media = true;//filter_var($args['media_buttons'], FILTER_VALIDATE_BOOLEAN);
        $settings['media_buttons'] = $media;
        ob_start();
        Utilities::editor(
            $request->request->filter('editorId', null, FILTER_SANITIZE_STRING),
            $request->request->filter('editorContent', '', FILTER_UNSAFE_RAW),
            $request->request->filter('editorName', null, FILTER_SANITIZE_STRING),
            $media,
            $settings
        );
        $html = stripslashes_deep(ob_get_clean());

        return new AjaxSuccessResponse(
            'Editor markup retrieved', array(
                'html' => $html
            )
        );

    }

}
