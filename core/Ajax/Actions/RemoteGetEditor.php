<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\Utilities;

/**
 * Class RemoteGetEditor
 * Return the markup for an built-in tinymce editor instance
 * @package Kontentblocks\Ajax
 */
class RemoteGetEditor
{

    static $nonce = 'kb-read';

    public static function run( ValueStorageInterface $Request )
    {

        $args = $Request->getFiltered( 'args' );
        $settings = array();
        $settings['textarea_name'] = $Request->getFiltered( 'editorName', FILTER_SANITIZE_STRING );
        $media = filter_var( $args['media_buttons'], FILTER_VALIDATE_BOOLEAN );
        $settings['media_buttons'] = $media;
        ob_start();
        Utilities::editor(
            $Request->getFiltered( 'editorId', FILTER_SANITIZE_STRING ),
            $Request->getFiltered( 'editorContent', FILTER_SANITIZE_STRING ),
            $Request->getFiltered( 'editorName', FILTER_SANITIZE_STRING ),
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
