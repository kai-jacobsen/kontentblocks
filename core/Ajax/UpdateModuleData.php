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

        $moduleSettings = $_POST['module'];
        $data = $_POST['data'];
        $postId = filter_input(INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT);

        // setup global post
        $post = get_post( $postId );
        setup_postdata( $post );

        $Environment = Utilities::getEnvironment( $postId );
        $Factory = new ModuleFactory( $moduleSettings['class'], $moduleSettings, $Environment );
        $Module = $Factory->getModule();

        // gather data
        $old = $Environment->getStorage()->getModuleData( $moduleSettings['instance_id'] );
        $new = $Module->save( $data, $old );
        $mergedData = Utilities::arrayMergeRecursiveAsItShouldBe( $new, $old );

        $Environment->getStorage()->saveModule( $Module->getId(), wp_slash( $mergedData ) );

        $mergedData = apply_filters( 'kb_modify_module_data', $mergedData, $Module->settings );

        $Module->setModuleData( $mergedData );

        $return = array(
            'newModuleData' => $mergedData
        );

        do_action( 'kb_save_backend_module', $moduleSettings, $Module );
        wp_send_json( $return );
    }

}
