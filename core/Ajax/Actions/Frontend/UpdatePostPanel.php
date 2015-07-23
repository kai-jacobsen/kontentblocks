<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdatePostPanel
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdatePostPanel implements AjaxActionInterface
{

    static $nonce = 'kb-update';


    /**
     * @param ValueStorageInterface $Request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {
        global $post;

        $postdata = self::setupPostData( $Request );

        // setup global post
        $post = get_post( $postdata->postId );
        setup_postdata( $post );

        // flags
        $Environment = Utilities::getEnvironment( $postdata->postId );
        // strip slashes from incoming data
        $newData = wp_unslash( $postdata->data );

        $Panel = \Kontentblocks\getPostPanel( $postdata->panel['mid'], $postdata->postId );

        // gather data
        $old = $Panel->data;
        $new = $Panel->fields( $Panel->FieldController )->save( $newData, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );

        // save slashed data, *_post_meta will add remove slashes again...
        if ($postdata->update) {
            $Environment->getDataProvider()->update( $postdata->panel['mid'], wp_slash( $mergedData ) );
        }
        do_action( 'kb.panel.save', $Panel, $mergedData );

        $return = array(
            'html' => '',
            'newModuleData' => $mergedData
        );

        do_action( 'kb.save.frontend.panel', $Panel, $postdata->update );
        return new AjaxSuccessResponse( 'Panel updated', $return );
    }

    /**
     * @param ValueStorageInterface $Request
     * @return \stdClass
     */
    private static function setupPostData( ValueStorageInterface $Request )
    {
        $stdClass = new \stdClass();
        $stdClass->data = $Request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->panel = $Request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->postId = filter_var( $stdClass->panel['postId'], FILTER_VALIDATE_INT );
        $stdClass->editmode = $Request->getFiltered( 'editmode', FILTER_SANITIZE_STRING );
        $stdClass->update = ( isset( $stdClass->editmode ) && $stdClass->editmode === 'update' ) ? true : false;
        return $stdClass;
    }

}
