<?php

namespace Kontentblocks\Ajax\Frontend;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModuleOptions
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdateModuleOptions
{

    public static function run()
    {
        global $post;
        check_ajax_referer( 'kb-update' );


//        define('KB_FRONTEND_SAVE', true);

        $module = $_POST['module'];
        $data = $_POST['data'];

        // setup global post
        $post = get_post( $module['post_id'] );
        setup_postdata( $post );

        // flags
        $update = ( isset( $_POST['editmode'] ) && $_POST['editmode'] === 'update' ) ? true : false;
        $refresh = ( isset( $_POST['refresh'] ) && $_POST['refresh'] === 'false' ) ? false : true;

        // parse urlencoded form query string
        $parsed = array();
        parse_str( $data, $parsed );

        $Environment = Utilities::getEnvironment( $module['post_id'] );

        $Factory = new ModuleFactory( $module['class'], $module, $Environment );
        $Module = $Factory->getModule();

        // gather data
        $old = $Environment->getStorage()->getModuleData( $module['instance_id'] );
        $new = $Module->save( $parsed[$Module->getId()], $old );
        $mergedData = Utilities::arrayMergeRecursiveAsItShouldBe( $new, $old );



        if ($update) {
            $Environment->getStorage()->saveModule( $Module->getId(), wp_slash( $mergedData ) );
        }

        $mergedData = apply_filters( 'kb_modify_module_data', $mergedData, $Module->settings );


        $Module->setModuleData( $mergedData );

        do_action( 'kb.module.save', $Module, $mergedData );

        $return = array(
            'html' => $Module->module(),
            'newModuleData' => $mergedData
        );

        // @TODO depreacate
        do_action( 'kb_save_frontend_module', $module, $update );

        $url = add_query_arg('concat', 'true', get_permalink($module['post_id']));
        wp_remote_get( $url, array('timeout' => 1) );


        wp_send_json( $return );
    }

}
