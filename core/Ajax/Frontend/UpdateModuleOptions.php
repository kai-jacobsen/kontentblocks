<?php

namespace Kontentblocks\Ajax\Frontend;

class UpdateModuleOptions
{

    public function __construct()
    {

        $module = $_POST[ 'module' ];
        $data   = $_POST[ 'data' ];
        $parsed = array();
        parse_str( $data, $parsed );

        $Environment = new \Kontentblocks\Admin\Post\PostEnvironment( $module[ 'post_id' ] );
        $Factory     = new \Kontentblocks\Modules\ModuleFactory( $module[ 'class' ], $module, $Environment );
        $instance    = $Factory->getModule();
        $dataHandler = \Kontentblocks\Helper\getDataHandler( $module[ 'post_id' ] );
        $old         = $dataHandler->getModuleData( '_' . $module[ 'instance_id' ] );
        $new         = $instance->save( $parsed[ $instance->instance_id ], $old );
        $mergedData = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe( $new, $old );

        $dataHandler->saveModule( $instance->instance_id, $mergedData );

        $instance->moduleData = $mergedData;

        $return = array(
            'html' => wp_kses_post( $instance->module( $mergedData ) ),
            'newModuleData' => $mergedData
        );

        wp_send_json( $return );

    }

}
