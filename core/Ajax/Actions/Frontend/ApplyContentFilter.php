<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class ApplyContentFilter
 * Runs frontend inline editable text through the_content filter
 * Used by inline text edit to restore oembed fragments after content change
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class ApplyContentFilter implements AjaxActionInterface
{
    static $nonce = 'kb-read';

    /**
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {
        global $post;
        $content = wp_unslash( $request->get( 'content' ) );
        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
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
