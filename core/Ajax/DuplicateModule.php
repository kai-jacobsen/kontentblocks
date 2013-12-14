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
        $this->class      = $_POST[ 'class' ];

        $this->Environment   = $this->setupEnvironment();
        $this->newInstanceId = $this->getNewInstanceId();

        $this->duplicate();

    }

    private function setupEnvironment()
    {
        return \Kontentblocks\Helper\getEnvironment($this->postId);

    }

    private function duplicate()
    {
        $moduleDefinition                          = $this->Environment->getDataHandler()->getModuleDefinition( $this->instanceId );
        $moduleDefinition[ 'settings' ][ 'draft' ] = true;
        $moduleDefinition[ 'instance_id' ]         = $this->newInstanceId;


        $update = $this->Environment->getDataHandler()->addToIndex( $moduleDefinition[ 'instance_id' ], $moduleDefinition );
        if ( $update !== true ) {
            wp_send_json_error( 'Update failed' );
        }
        else {
            $original = $this->Environment->getDataHandler()->getModuleData( $this->instanceId );
            $this->Environment->getDataHandler()->saveModule( $this->newInstanceId, $original );

            $moduleDefinition[ 'areaContext' ]  = filter_var( $_POST[ 'areaContext' ], FILTER_SANITIZE_STRING );

            $Factory     = new ModuleFactory( $this->class, $moduleDefinition, $this->Environment);
            $newInstance = $Factory->getModule();


            ob_start();
            $newInstance->_render_options();
            $html = ob_get_clean();


            $response = array
                (
                'id' => $this->newInstanceId,
                'module' => $moduleDefinition,
                'name' => $newInstance->settings[ 'public_name' ],
                'html' => $html
            );

            wp_send_json( $response );
        }

    }

    public function getNewInstanceId()
    {
        $base   = \Kontentblocks\Helper\getHighestId( $this->Environment->getDataHandler()->getIndex() );
        $prefix = apply_filters( 'kb_post_module_prefix', 'module-' );
        if ( $this->postId !== -1 ) {
            return $prefix . $this->postId . '_' . ++$base;
        }
        else {
            return $prefix . 'kb-block-da' . $this->moduleArgs[ 'area' ] . '_' . ++$base;
        }

    }

}
