<?php

namespace Kontentblocks\Extensions;
use Kontentblocks\Backend\Storage\BackupManager;

class LayoutTemplates
{

    public function __construct()
    {
        add_action( 'init', array( $this, 'postTypeSupport' ) );
        add_action( 'add_meta_boxes', array( $this, 'metaBox' ) );
        add_action( 'wp_ajax_get_layout_templates', array( $this, 'getTemplates' ) );
        add_action( 'wp_ajax_set_layout_template', array( $this, 'setTemplate' ) );
        add_action( 'wp_ajax_delete_layout_template', array($this, 'deleteTemplate'));
        add_action( 'init', array( $this, 'observeQuery' ) );

    }

    public function metaBox()
    {
        $screen = get_current_screen();

        if ( post_type_supports( $screen->post_type, 'layout-templates' ) ) {
            add_meta_box( 'kb-layout-templates', 'Layout Templates', array( $this, 'controls' ), $screen->post_type, 'side', 'high' );
        }


    }

    public function controls()
    {
        echo "<div id='layout-templates'></div>";
    }

    public function postTypeSupport()
    {
        add_post_type_support( 'page', 'layout-templates' );

    }
    public function getTemplates()
    {

        $data   = $_REQUEST[ 'data' ];
        $config = (!empty( $data[ 'areaConfig' ] )) ? $data[ 'areaConfig' ] : wp_send_json_error();

        $templates = get_option( 'kb_layout_templates' );

        if ( isset( $templates[ $config ] ) ) {
            wp_send_json( $templates[ $config ] );
        }
        else {
            wp_send_json_error();
        }

    }

    public function setTemplate()
    {


        $data    = $_REQUEST[ 'data' ];
        $post_id = $_REQUEST[ 'post_id' ];
        $config  = (!empty( $data[ 'areaConfig' ] )) ? $data[ 'areaConfig' ] : wp_send_json_error();
        $name    = (!empty( $data[ 'name' ] )) ? $data[ 'name' ] : wp_send_json_error();

        if ( isset( $config ) ) {
            if ( $this->_saveTemplate( $config, $name, $post_id ) ) {
                wp_send_json_success();
            }
            else {
                wp_send_json_error();
            }
        }

    }
    public function deleteTemplate()
    {


        $data    = $_REQUEST[ 'data' ];
        $post_id = $_REQUEST[ 'post_id' ];
        $config  = (!empty( $data[ 'areaConfig' ] )) ? $data[ 'areaConfig' ] : wp_send_json_error();
        $name    = (!empty( $data[ 'name' ] )) ? $data[ 'name' ] : wp_send_json_error();

        if ( isset( $config ) ) {
            if ( $this->_deleteTemplate( $config, $name, $post_id ) ) {
                wp_send_json_success();
            }
            else {
                wp_send_json_error('failed');
            }
        }

    }

    private function _saveTemplate( $config, $name, $post_id )
    {
        $templates = get_option( 'kb_layout_templates' );
        $id        = sanitize_title( $name );
        $bucket    = (!empty( $templates[ $config ] )) ? $templates[ $config ] : array( );

        if ( !isset( $bucket[ $id ] ) ) {
            $bucket[ $id ] = array(
                'name' => $name,
                'layout' => $this->_normalizeLayout( $post_id )
            );

            $templates[ $config ] = $bucket;
            update_option( 'kb_layout_templates', $templates );
            wp_send_json_success();
        }

    }
    
    private function _deleteTemplate( $config, $id, $post_id )
    {
        $templates = get_option( 'kb_layout_templates' );
        $bucket    = (!empty( $templates[ $config ] )) ? $templates[ $config ] : array( );
        
        if ( isset( $bucket[ $id ] ) ) {
            unset($bucket[ $id ]);

            $templates[ $config ] = $bucket;
            return update_option( 'kb_layout_templates', $templates );
            
        }

    }

    private function _normalizeLayout( $post_id )
    {
        $layout = get_post_meta( $post_id, 'kb_kontentblocks', true );

        if ( !empty( $layout ) ) {
            $collection = array( );

            foreach ( $layout as $bucket ) {
                $unique                = uniqid();
                $bucket[ 'draft' ]       = 'true';
                $bucket[ 'instance_id' ] = NULL;

                $collection[ $unique ] = $bucket;
            };
        }

        return $collection;

    }

    public function observeQuery()
    {
        if ( isset( $_GET[ 'load_template' ] ) ) {
            $setup_data = $this->_resetPostMeta( $_GET[ 'load_template' ], $_GET[ 'post_id' ], $_GET[ 'config' ] );
            if ( $setup_data ) {
                $location = add_query_arg( array( 'load_template' => false, 'post_id' => false, 'config' => false ) );
                wp_redirect( $location );
            }
        }

    }

    private function _resetPostMeta( $template, $post_id, $config )
    {
        $Storage = \Kontentblocks\Helper\getStorage($post_id);
        $BackupManager = new BackupManager($Storage);
        $templates = get_option( 'kb_layout_templates' );

        if ( isset( $templates[ $config ][ $template ] ) ) {
            $BackupManager->backup('Before loading template:' . $template );
            $Storage->deleteAll();
            
            $prepare = $this->_prepareFromTemplate($templates[ $config ][ $template ], $post_id);
            return $Storage->saveIndex($prepare); // returns bool
        }
        return false;
        
    }

    private function _prepareFromTemplate($index, $post_id)
    {
        $i = 1;
        $collection = array();
        
        foreach ($index['layout'] as $args){
            $new_id = 'module-' . $post_id . '_' . $i;
            $args['instance_id'] = $new_id;
            $collection[$new_id] = $args;
            $i++;
        }
        return $collection;
    }
}
new LayoutTemplates();