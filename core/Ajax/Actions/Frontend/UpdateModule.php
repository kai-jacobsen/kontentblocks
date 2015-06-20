<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModule
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdateModule implements AjaxActionInterface
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
        $newData = wp_unslash( $postdata->data[$postdata->module['mid']] );
        $Workshop = new ModuleWorkshop( $Environment, $postdata->module );
        $Module = $Workshop->getModule();

        // master module will change instance id to correct template id
        apply_filters( 'kb.modify.module.save', $Module );


        // gather data
        $old = $Environment->getStorage()->getModuleData( $Module->getId() );
        $new = $Module->save( $newData, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );

        if ($postdata->update) {
            $Environment->getStorage()->saveModule( $Module->getId(), $mergedData );
        }
        $Module->setModuleData( $mergedData );
        do_action( 'kb.module.save', $Module, $mergedData );

        $return = array(
            'html' => $Module->module(),
            'newModuleData' => $mergedData
        );

        do_action( 'kb.save.frontend.module', $Module, $postdata->update );
        Utilities::remoteConcatGet( $Module->Properties->post_id );
        return new AjaxSuccessResponse( 'Module updated', $return );
    }

    /**
     * @param ValueStorageInterface $Request
     * @return \stdClass
     */
    private static function setupPostData( ValueStorageInterface $Request )
    {
        $stdClass = new \stdClass();
        $stdClass->data = $Request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->module = $Request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->postId = filter_var( $stdClass->module['post_id'], FILTER_VALIDATE_INT );
        $stdClass->editmode = $Request->getFiltered( 'editmode', FILTER_SANITIZE_STRING );
        $stdClass->update = ( isset( $stdClass->editmode ) && $stdClass->editmode === 'update' ) ? true : false;
        return $stdClass;
    }

}
