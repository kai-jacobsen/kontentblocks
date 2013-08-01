<?php

namespace Kontentblocks\Plugins;

class Layout_Templates
{

    public function __construct()
    {
        add_action( 'init', array( $this, 'add_default_post_type_support' ) );
        add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
        add_action( 'wp_ajax_get_layout_templates', array( $this, 'get_templates'));
        add_action( 'wp_ajax_set_layout_template', array($this, 'set_template'));
    }

    public function add_meta_box()
    {
        $screen = get_current_screen();

        if ( post_type_supports( $screen->post_type, 'layout-templates' ) ) {
            add_meta_box( 'kb-layout-templates', 'Layout Templates', array( $this, 'meta_box_controls' ), $screen->post_type, 'side', 'high' );
        }
        
        add_action('admin_print_scripts', array($this, 'print_scripts'));
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
        wp_enqueue_script('layout-templates', KB_PLUGIN_URL . '/js/LayoutTemplates.js', array('backbone', 'underscore'), null, true);
    }
    
    public function get_templates(){
        
        $data = $_REQUEST['data'];
        
        wp_send_json($data);
        
    }

}

new Layout_Templates();