<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModule
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdateModule
{

    public static function run()
    {
        global $post;
        check_ajax_referer( 'kb-update' );


//        define('KB_FRONTEND_SAVE', true);

        $module = $_POST['module'];
        $data = filter_input( INPUT_POST, 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );

        if (is_null( $data )) {
            wp_send_json_error();
        }

        $postId = filter_var( $module['post_id'], FILTER_VALIDATE_INT );
        $editmode = filter_input( INPUT_POST, 'editmode', FILTER_SANITIZE_STRING );
        $update = ( isset( $editmode ) && $editmode === 'update' ) ? true : false;
        // setup global post
        $post = get_post( $postId );
        setup_postdata( $post );

        // flags

        $Environment = Utilities::getEnvironment( $module['post_id'] );

        $newData = $data[$module['instance_id']];

        $Factory = new ModuleFactory( $module['class'], $module, $Environment );
        $Module = $Factory->getModule();

        // master module will change instance id to correct template id
        $module = apply_filters( 'kb.modify.module.save', $module );

        // gather data
        $old = $Environment->getStorage()->getModuleData( $module['instance_id'] );
        $new = $Module->save( $newData, $old );

        $mergedData = Utilities::arrayMergeRecursive( $new, $old );

        if ($update) {
            $Environment->getStorage()->saveModule( $module['instance_id'], wp_slash( $mergedData ) );
        }

        $Module->setModuleData( $mergedData );

        do_action( 'kb.module.save', $Module, $mergedData );

        $return = array(
            'html' => $Module->module(),
            'newModuleData' => $mergedData
        );

        // @TODO depreacate
        do_action( 'kb_save_frontend_module', $module, $update );
        Utilities::remoteConcatGet( $module['post_id'] );
        wp_send_json( $return );
    }

}
