<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModuleData
 *
 * Handle async data saving from backend edit screens for a single module
 *
 * @package Kontentblocks\Ajax\Frontend
 * @since 1.0.0
 */
class UpdateModuleData
{

    /**
     * Sends new module data as json formatted object
     *
     * @return void
     * @since 1.0.0
     */
    public static function run()
    {
        global $post;
        check_ajax_referer( 'kb-update' );

        $moduleArgs = Utilities::validateBoolRecursive($_POST['module']);
        $data = $_POST['data'];
        $postId = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );

        // setup global post
        $post = get_post( $postId );
        setup_postdata( $post );

        $Environment = Utilities::getEnvironment( $postId );
        $Factory = new ModuleFactory( $moduleArgs['class'], $moduleArgs, $Environment );
        $Module = $Factory->getModule();

        // gather data
        $old = $Environment->getStorage()->getModuleData( $moduleArgs['instance_id'] );
        $new = $Module->save( $data, $old );
        $mergedData = Utilities::arrayMergeRecursiveAsItShouldBe( $new, $old );
        $Environment->getStorage()->saveModule( $Module->getId(), wp_slash( $mergedData ) );

        $mergedData = apply_filters( 'kb_modify_module_data', $mergedData, $Module->settings );

        $Module->setModuleData( $mergedData );
        unset( $moduleArgs['settings'] );
        unset( $moduleArgs['moduleData'] );
        $moduleArgs['viewfile'] = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';

        $comp = $Environment->getStorage()->getModuleDefinition( $Module->getId() );
        $moduleArgs = wp_parse_args( $moduleArgs, $comp );
        $Environment->getStorage()->addToIndex( $Module->getId(), $moduleArgs );

        $return = array(
            'newModuleData' => $mergedData
        );

        // @TODO deprecate
        do_action( 'kb_save_backend_module', $moduleArgs, $Module );
        do_action( 'kb.module.save', $Module, $mergedData );

        Utilities::remoteConcatGet( $postId );

        wp_send_json( $return );
    }

}
