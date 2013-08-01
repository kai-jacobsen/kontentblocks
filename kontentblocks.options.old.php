<?php
// MEnu Page Init
add_action( 'admin_menu', 'kb_add_option_menus', 90 );
add_action( 'admin_enqueue_scripts', 'enqueue_option_scripts' );

function kb_add_option_menus()
{
	
	
	// Main Activation Menu Page
	add_menu_page( 'Kontentblocks', 'Kontentblocks', 'admin_kontentblocks', 'kontentblocks', 'kb_capabilities_page', KB_PLUGIN_URL . 'css/logo16.png',150 );

	// Capabilities
	include_once(plugin_dir_path( __FILE__ ) . 'includes/options/kb.options.capabilities.php');
	
	
	// Manage Blocks of Dynamic Areas
	$kb_dynamic_areas = add_submenu_page('kontentblocks', 'Dynamic Areas', 'Dynamic Areas', 'manage_kontentblocks', 'dynamic_areas', 'kb_dynamic_areas');
	
	 add_menu_page('dynamic_areas', 'Dynamische Bereiche', 'manage_kontentblocks', 'dynamic_areas', 'kb_dynamic_areas');
	
	
	add_submenu_page( 'kontentblocks', 'Kontentblocks Testing', 'Testing', 'admin_kontentblocks', 'kbtests', 'kb_testing_page' );
	
	// Manage Block Templates
	add_submenu_page( 'kontentblocks', 'Block Templates', 'Block Templates', 'admin_kontentblocks', 'block_templates', 'kb_block_templates');
	
	
	add_action("load-{$kb_dynamic_areas}", 'kb_dynamic_area_cb');
	add_action( 'admin_print_styles-kontentblocks_page_kontentareas', 'kb_option_enqueue_files' , 30 );
}

function kb_option_enqueue_files()
{
	wp_enqueue_style( 'kontentblocks-base', KB_PLUGIN_URL . 'css/kontentblocks.css' );
}

function kb_dynamic_area_cb()
{
	wp_enqueue_script('dynamic_area',KB_PLUGIN_URL.'js/dynamic_areas.js');
		
}


function enqueue_option_scripts()
{
	wp_enqueue_style( 'kb_option_styles', KB_PLUGIN_URL . '/css/kb_options.css' );
	wp_enqueue_script( 'jquery-ui-tabs', NULL, array( 'jquery', 'jquery-ui' ) );
	wp_enqueue_script( 'kb_add_area', KB_PLUGIN_URL . 'js/KBOptions.js' );

}

// Dynamic Areas
include_once(plugin_dir_path( __FILE__ ) . 'includes/options/areas/kb.options.class.dynamic_areas.table.php');
include_once(plugin_dir_path( __FILE__ ) . 'includes/options/areas/kb.options.areas.dynamic.php');
include_once(plugin_dir_path( __FILE__ ) . 'includes/options/thickbox/tb.edit.dynamic-areas.php');

// Block Templates
include_once(plugin_dir_path( __FILE__ ) . 'includes/options/blocks/kb.options.class.block-templates.table.php');
include_once(plugin_dir_path( __FILE__ ) . 'includes/options/blocks/kb.options.block-templates.php');

// On Site Editing
include_once(plugin_dir_path( __FILE__ ) . 'includes/options/thickbox/tb.onsite.edit.blocks.php');

function kb_testing_page()
{
	$query = get_posts( array ( 'post_type' => 'any', 'meta_key' => 'kb_kontentblocks' ) );
	
	if (!empty($query))
	{
		foreach ($query as $post)
		{
			$collection[$post->ID] = get_post_meta($post->ID, 'kb_kontentblocks', true);
		}
		
		foreach ($collection as $block )
		{
			
			$recollect[] = $block;
		}
	}
	
	$option = get_option('fwk_settings');
	d($recollect);
}