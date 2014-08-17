<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 *
 * Class UpdateModuleData
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdateModuleData
{

    public static function run()
    {
        global $post;
        check_ajax_referer( 'kb-update' );


        $module = $_POST['module'];
        $data = $_POST['data'];

        // setup global post
        $post = get_post( $module['post_id'] );
        setup_postdata( $post );

        // parse urlencoded form query string

        $Environment = Utilities::getEnvironment( $module['post_id'] );

        $Factory = new ModuleFactory( $module['class'], $module, $Environment );
        $Module = $Factory->getModule();

        // gather data
        $old = $Environment->getStorage()->getModuleData( $module['instance_id'] );
        $new = $Module->save( $data, $old );
        $mergedData = Utilities::arrayMergeRecursiveAsItShouldBe( $new, $old );

        $Environment->getStorage()->saveModule( $Module->instance_id, wp_slash( $mergedData ) );

        $mergedData = apply_filters( 'kb_modify_module_data', $mergedData, $Module->settings );

        $Module->setModuleData( $mergedData );

        $return = array(
            'newModuleData' => $mergedData
        );

        do_action( 'kb_save_backend_module', $module );
        wp_send_json( $return );
    }

}
