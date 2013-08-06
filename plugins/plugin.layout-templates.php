<?php

namespace Kontentblocks\Plugins;

class Layout_Templates
{

    public function __construct()
    {
        add_action( 'init', array( $this, 'add_default_post_type_support' ) );
        add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
        add_action( 'wp_ajax_get_layout_templates', array( $this, 'get_templates' ) );
        add_action( 'wp_ajax_set_layout_template', array( $this, 'set_template' ) );
        add_action( 'wp_ajax_delete_layout_template', array($this, 'delete_template'));
        add_action( 'init', array( $this, 'observe_query' ) );

    }

    public function add_meta_box()
    {
        $screen = get_current_screen();

        if ( post_type_supports( $screen->post_type, 'layout-templates' ) ) {
            add_meta_box( 'kb-layout-templates', 'Layout Templates', array( $this, 'meta_box_controls' ), $screen->post_type, 'side', 'high' );
        }

        add_action( 'admin_print_scripts', array( $this, 'print_scripts' ) );

    }

    public function meta_box_controls()
    {
        echo "<div id='layout-templates'></div>";

    }

    public function add_default_post_type_support()
    {
        add_post_type_support( 'page', 'layout-templates' );

    }

    public function print_scripts()
    {
        wp_enqueue_script( 'layout-templates', KB_PLUGIN_URL . '/js/LayoutTemplates.js', array( 'backbone', 'underscore' ), null, true );

    }

    public function get_templates()
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

    public function set_template()
    {


        $data    = $_REQUEST[ 'data' ];
        $post_id = $_REQUEST[ 'post_id' ];
        $config  = (!empty( $data[ 'areaConfig' ] )) ? $data[ 'areaConfig' ] : wp_send_json_error();
        $name    = (!empty( $data[ 'name' ] )) ? $data[ 'name' ] : wp_send_json_error();

        if ( isset( $config ) ) {
            if ( $this->_save_template( $config, $name, $post_id ) ) {
                wp_send_json_success();
            }
            else {
                wp_send_json_error();
            }
        }

    }
    public function delete_template()
    {


        $data    = $_REQUEST[ 'data' ];
        $post_id = $_REQUEST[ 'post_id' ];
        $config  = (!empty( $data[ 'areaConfig' ] )) ? $data[ 'areaConfig' ] : wp_send_json_error();
        $name    = (!empty( $data[ 'name' ] )) ? $data[ 'name' ] : wp_send_json_error();

        if ( isset( $config ) ) {
            if ( $this->_delete_template( $config, $name, $post_id ) ) {
                wp_send_json_success();
            }
            else {
                wp_send_json_error('failed');
            }
        }

    }

    private function _save_template( $config, $name, $post_id )
    {
        $templates = get_option( 'kb_layout_templates' );
        $id        = sanitize_title( $name );
        $bucket    = (!empty( $templates[ $config ] )) ? $templates[ $config ] : array( );

        if ( !isset( $bucket[ $id ] ) ) {
            $bucket[ $id ] = array(
                'name' => $name,
                'layout' => $this->_normalize_current_layout( $post_id )
            );

            $templates[ $config ] = $bucket;
            update_option( 'kb_layout_templates', $templates );
            wp_send_json_success();
        }

    }
    
    private function _delete_template( $config, $id, $post_id )
    {
        $templates = get_option( 'kb_layout_templates' );
        $bucket    = (!empty( $templates[ $config ] )) ? $templates[ $config ] : array( );
        
        if ( isset( $bucket[ $id ] ) ) {
            unset($bucket[ $id ]);

            $templates[ $config ] = $bucket;
            return update_option( 'kb_layout_templates', $templates );
            
        }

    }

    private function _normalize_current_layout( $post_id )
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

    public function observe_query()
    {
        if ( isset( $_GET[ 'load_template' ] ) ) {
            $setup_data = $this->_reset_post_meta( $_GET[ 'load_template' ], $_GET[ 'post_id' ], $_GET[ 'config' ] );
            if ( $setup_data ) {
                $location = add_query_arg( array( 'load_template' => false, 'post_id' => false, 'config' => false ) );
                wp_redirect( $location );
            }
        }

    }

    private function _reset_post_meta( $template, $post_id, $config )
    {

        $Meta = new \KB_Post_Meta( $post_id );

        $templates = get_option( 'kb_layout_templates' );

        if ( isset( $templates[ $config ][ $template ] ) ) {
            $Meta->backup('Before loading template:' . $template );
            $Meta->delete();
            
            $prepare = $this->_prepare_from_template($templates[ $config ][ $template ], $post_id);
            return $Meta->saveIndex($prepare); // returns bool
        }
        return false;
        
    }

    private function _prepare_from_template($index, $post_id)
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

new Layout_Templates();