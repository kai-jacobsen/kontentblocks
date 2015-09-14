<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

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
     * @param ValueStorageInterface $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {
        $posts = [ ];
        $ids = array_unique( $request->get( 'postIds' ) );
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