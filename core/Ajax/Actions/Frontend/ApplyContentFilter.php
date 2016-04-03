<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ApplyContentFilter
 * Runs frontend inline editable text through the_content filter
 * Used by inline text edit to restore oembed fragments after content change
 * @package Kontentblocks\Ajax\Frontend
 */
class ApplyContentFilter implements AjaxActionInterface
{
    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    public static function run(Request $request)
    {
        global $post;
        $content = wp_unslash($request->request->get('content'));
        $postId = $request->request->getInt('postId', null);
        $post = get_post($postId);
        setup_postdata($post);
        $html = apply_filters('the_content', $content);
        return new AjaxSuccessResponse(
            'Content filter applied', array(
                'content' => $html
            )
        );
    }
}
