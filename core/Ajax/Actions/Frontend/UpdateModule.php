<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModule
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdateModule
{

    /**
     *
     */
    public static function run()
    {
        global $post;
        check_ajax_referer( 'kb-update' );


//        define('KB_FRONTEND_SAVE', true);

        $postdata = self::setupPostData();

        // setup global post
        $post = get_post( $postdata->postId );
        setup_postdata( $post );

        // flags

        $Environment = Utilities::getEnvironment( $postdata->postId );

        $newData = $postdata->data[$postdata->module['mid']];
        $Workshop = new ModuleWorkshop($Environment, $postdata->module);
        $Module = $Workshop->getModule();

        // master module will change instance id to correct template id
        apply_filters( 'kb.modify.module.save', $Module );

        // gather data
        $old = $Environment->getStorage()->getModuleData( $Module->getId() );
        $new = $Module->save( $newData, $old );

        $mergedData = Utilities::arrayMergeRecursive( $new, $old );

        if ($postdata->update) {
            $Environment->getStorage()->saveModule( $Module->getId(), wp_slash( $mergedData ) );
        }

        $Module->setModuleData( $mergedData );

        do_action( 'kb.module.save', $Module, $mergedData );

        $return = array(
            'html' => $Module->module(),
            'newModuleData' => $mergedData
        );

        // @TODO depreacate
        do_action( 'kb_save_frontend_module', $Module, $postdata->update );
        Utilities::remoteConcatGet( $Module->Properties->post_id );
        wp_send_json( $return );
    }

    private static function setupPostData()
    {
        $stdClass = new \stdClass();
        $stdClass->data = filter_input( INPUT_POST, 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->module = filter_input( INPUT_POST, 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->postId = filter_var( $stdClass->module['post_id'], FILTER_VALIDATE_INT );
        $stdClass->editmode = filter_input( INPUT_POST, 'editmode', FILTER_SANITIZE_STRING );
        $stdClass->update = ( isset( $stdClass->editmode ) && $stdClass->editmode === 'update' ) ? true : false;

        return $stdClass;
    }

}
