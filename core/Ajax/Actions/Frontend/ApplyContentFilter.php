<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ApplyContentFilter
 * Runs frontend inline editable text through the_content filter
 * Used by inline text edit to restore oembed fragments after content change
 */
class ApplyContentFilter extends AbstractAjaxAction
{
    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
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
