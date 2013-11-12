<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Admin\Post\PostMetaDataHandler,
    Kontentblocks\Utils\GlobalDataHandler,
    Kontentblocks\Modules\ModuleFactory;

class DuplicateModule
{

    protected $postId;
    protected $dataHandler;
    protected $instanceId;

    public function __construct()
    {
        $this->postId     = $_POST[ 'post_id' ];
        $this->instanceId = $_POST[ 'module' ];

        $this->dataHandler   = $this->getDataHandler();
        $this->newInstanceId = $this->getNewInstanceId();

        $this->duplicate();

    }

    private function getDataHandler()
    {
        if ( $this->postId === -1 ) {
            return new GlobalDataHandler();
        }
        else {
            return new PostMetaDataHandler( $this->postId );
        }

    }

    private function duplicate()
    {
        $moduleDefinition                          = $this->dataHandler->getModuleDefinition( $this->instanceId );
        $moduleDefinition[ 'settings' ][ 'draft' ] = true;
        $moduleDefinition[ 'instance_id' ]         = $this->newInstanceId;


        $update = $this->dataHandler->addToIndex( $moduleDefinition[ 'instance_id' ], $moduleDefinition );
        if ( $update !== true ) {
            wp_send_json_error( 'Update failed' );
        }
        else {
            $original = $this->dataHandler->getModuleData( $this->instanceId );
            $this->dataHandler->saveModule( $this->newInstanceId, $original );


            $moduleDefinition[ 'page_template' ] = filter_var( $_POST[ 'page_template' ], FILTER_SANITIZE_STRING );
            $moduleDefinition[ 'post_type' ]     = filter_var( $_POST[ 'post_type' ], FILTER_SANITIZE_STRING );
            $moduleDefinition[ 'area_context' ]  = filter_var( $_POST[ 'area_context' ], FILTER_SANITIZE_STRING );

            $Factory     = new ModuleFactory( $moduleDefinition );
            $newInstance = $Factory->getModule();


            ob_start();
            $newInstance->_render_options();
            $html = ob_get_clean();

            $response = array
                (
                'id' => $this->newInstanceId,
                'module' => get_object_vars( $newInstance ),
                'name' => $newInstance->settings[ 'public_name' ],
                'html' => $html
            );

            wp_send_json( $response );
        }

    }

    public function getNewInstanceId()
    {
        $base   = \Kontentblocks\Helper\getHighestId( $this->dataHandler->getIndex() );
        $prefix = apply_filters( 'kb_post_module_prefix', 'module-' );
        if ( $this->postId !== -1 ) {
            return $prefix . $this->postId . '_' . ++$base;
        }
        else {
            return $prefix . 'kb-block-da' . $this->moduleArgs[ 'area' ] . '_' . ++$base;
        }

    }

}
