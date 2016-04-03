<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetPostObjects
 *
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class GetPostObjects implements AjaxActionInterface
{

    static $nonce = 'kb-read';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( Request $request )
    {
        $posts = array();
        $ids = array_unique( $request->request->filter( 'postIds', array(), FILTER_DEFAULT ) );
        if (!empty( $ids )) {
            $args = array(
                'include' => $ids,
                'post_type' => 'any',
                'posts_per_page' => - 1
            );
            $posts = get_posts( $args );
        }

        return new AjaxSuccessResponse(
            'Queried posts', array(
                'posts' => $posts
            )
        );


    }


}