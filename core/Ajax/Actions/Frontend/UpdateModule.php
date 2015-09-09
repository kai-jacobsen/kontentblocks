<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
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
     * @param ValueStorageInterface $request
     * @param bool $send
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request, $send = true )
    {
        global $post;

        $postdata = self::setupPostData( $request );

        // setup global post
        $post = get_post( $postdata->postId );
        setup_postdata( $post );

        // flags
        $environment = Utilities::getEnvironment( $postdata->postId );
        // strip slashes from incoming data
        $newData = wp_unslash( $postdata->data );
        $workshop = new ModuleWorkshop( $environment, $postdata->module );
        $module = $workshop->getModule();

        // master module will change instance id to correct template id
        apply_filters( 'kb.modify.module.save', $module->properties );

        // gather data
        $old = $environment->getStorage()->getModuleData( $module->getId() );
        $new = $module->save( $newData, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );
        // save slashed data, *_post_meta will add remove slashes again...
        if ($postdata->update) {
            $environment->getStorage()->saveModule( $module->getId(), wp_slash($mergedData) );
        }
        $module->updateModuleData( $mergedData );
        do_action( 'kb.module.save', $module, $mergedData );

        $return = array(
            'html' => $module->module(),
            'newModuleData' => $mergedData,
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON()
        );

        do_action( 'kb.save.frontend.module', $module, $postdata->update );
        Utilities::remoteConcatGet( $module->properties->postId );
        return new AjaxSuccessResponse( 'Module updated', $return, $send );
    }

    /**
     * @param ValueStorageInterface $request
     * @return \stdClass
     */
    private static function setupPostData( ValueStorageInterface $request )
    {
        $stdClass = new \stdClass();
        $stdClass->data = $request->get( 'data');
        $stdClass->module = $request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->postId = filter_var( $stdClass->module['parentObjectId'], FILTER_VALIDATE_INT );
        $stdClass->editmode = $request->getFiltered( 'editmode', FILTER_SANITIZE_STRING );
        $stdClass->update = ( isset( $stdClass->editmode ) && $stdClass->editmode === 'update' ) ? true : false;
        return $stdClass;
    }

}
