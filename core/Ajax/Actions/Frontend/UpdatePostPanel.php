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
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {
        global $post;

        $postdata = self::setupPostData( $request );

        // setup global post
        $post = get_post( $postdata->postId );
        setup_postdata( $post );

        // flags
        $environment = Utilities::getPostEnvironment( $postdata->postId );
        // strip slashes from incoming data
        $newData = wp_unslash( $postdata->data );

        $panel = \Kontentblocks\getPostPanel( $postdata->panel['mid'], $postdata->postId );

        // gather data
        $old = $panel->model->export();
        $new = $panel->fields->save( $newData, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );

        // save slashed data, *_post_meta will add remove slashes again...
        if ($postdata->update) {
            // wp_slash called by update method of postMetaDataProvider
            $environment->getDataProvider()->update( $postdata->panel['mid'],  $mergedData  );
        }
        do_action( 'kb.panel.save', $panel, $mergedData );

        $return = array(
            'html' => '',
            'newModuleData' => $mergedData
        );

        do_action( 'kb.save.frontend.panel', $panel, $postdata->update );
        return new AjaxSuccessResponse( 'Panel updated', $return );
    }

    /**
     * @param ValueStorageInterface $request
     * @return \stdClass
     */
    public static function setupPostData( ValueStorageInterface $request )
    {
        $stdClass = new \stdClass();
        $stdClass->data = $request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->panel = $request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->postId = filter_var( $stdClass->panel['postId'], FILTER_VALIDATE_INT );
        $stdClass->editmode = $request->getFiltered( 'editmode', FILTER_SANITIZE_STRING );
        $stdClass->update = ( isset( $stdClass->editmode ) && $stdClass->editmode === 'update' ) ? true : false;
        return $stdClass;
    }

}
