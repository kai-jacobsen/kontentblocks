<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxSuccessResponse;
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

        $moduleArgs = Utilities::validateBoolRecursive( $_POST['module'] );
        $data = $_POST['data'];
        $postId = filter_input( INPUT_POST, 'post_id', FILTER_VALIDATE_INT );

        // setup global post
        $post = get_post( $postId );
        setup_postdata( $post );

        $Environment = Utilities::getEnvironment( $postId );
        $Module = $Environment->getModuleById(filter_var($moduleArgs['mid'], FILTER_SANITIZE_STRING));

        // gather data
        $old = $Module->Model->export();
        $new = $Module->save( $data, $old );
        $mergedData = Utilities::arrayMergeRecursive( $new, $old );
        $Environment->getStorage()->saveModule( $Module->getId(), wp_slash( $mergedData ) );
        $mergedData = apply_filters( 'kb.module.modify.data', $mergedData, $Module );
        $Module->Model->set($mergedData);
        $Module->Properties->viewfile = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';

        $Environment->getStorage()->reset();
        $Environment->getStorage()->addToIndex( $Module->getId(), $Module->Properties->export() );

        $return = array(
            'newModuleData' => $mergedData
        );
        do_action( 'kb.module.save', $Module, $mergedData );
        Utilities::remoteConcatGet( $postId );

        new AjaxSuccessResponse('Module data updated.', $return);
    }

}
