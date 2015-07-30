<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\Utilities;

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
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {

        $args = $request->getFiltered( 'args' );
        $settings = array();
        $settings['textarea_name'] = $request->getFiltered( 'editorName', FILTER_SANITIZE_STRING );
        $media = filter_var( $args['media_buttons'], FILTER_VALIDATE_BOOLEAN );
        $settings['media_buttons'] = $media;
        ob_start();
        Utilities::editor(
            $request->getFiltered( 'editorId', FILTER_SANITIZE_STRING ),
            $request->getFiltered( 'editorContent', FILTER_SANITIZE_STRING ),
            $request->getFiltered( 'editorName', FILTER_SANITIZE_STRING ),
            $media,
            $settings
        );
        $html = stripslashes_deep( ob_get_clean() );

        return new AjaxSuccessResponse(
            'Editor markup retrieved', array(
                'html' => $html
            )
        );

    }

}
