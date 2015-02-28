<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class ApplyContentFilter
 * Runs frontend inline editable text through the_content filter
 * Used by inline text edit to restore oembed fragments after content change
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class ApplyContentFilter
{
    static $nonce = 'kb-read';

    /**
     * @param ValueStorageInterface $Request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {
        global $post;
        $content = wp_unslash( $Request->get( 'content' ) );
        $postId = $Request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $post = get_post( $postId );
        setup_postdata( $post );
        $html = apply_filters( 'the_content', $content );
        return new AjaxSuccessResponse(
            'Content filter apllied', array(
                'content' => $html
            )
        );
    }
}
