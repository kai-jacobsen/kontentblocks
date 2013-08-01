<?php

namespace Kontentblocks\Admin\Sidebars;


// Actions
add_action( 'admin_menu', 'Kontentblocks\Admin\Sidebars\add_menu');
add_action('init', 'Kontentblocks\Admin\Sidebars\kontentblocks_sidebars_action_switch',100);

// table view
include 'kontentblocks.table.sidebars.php';


// Add menu page
function add_menu(){
	
	$kb_sidebars = add_menu_page('Kontentblocks Sidebars', 'Sidebars', 'manage_kontentblocks', 'kontentblocks-sidebars', 'Kontentblocks\Admin\Sidebars\sidebars_init');
	add_submenu_page('kontentblocks-sidebars', 'Overview', 'All Sidebars', 'manage_kontentblocks', 'kontentblocks-sidebars');
};



// Main Callback
function sidebars_init()
{
	global $current_screen;
	
	$sidebars_table = new Kontentblocks_Sidebars_Table();
	
	
	
	// get action
	$action = ( $sidebars_table->current_action());

	// What happens now?
	switch ($action)
	{	
		
		// This calls the edit screen for the contents of this sidebar
		case 'edit':
			include plugin_dir_path( __FILE__ ) . 'kontentblocks.menu.sidebars.edit.php';
		break;

		// This calls the edit screen for the settings of this sidebar
		case 'edit-settings':
			include plugin_dir_path( __FILE__ ) . 'kontentblocks.menu.sidebars.settings.php';
		break;

		// This calls the form to add a new sidebar area
		case 'add-form-dynamic':
			include plugin_dir_path( __FILE__ ) . 'kontentblocks.menu.sidebars.addnew.php';
		break;
	
		// No action shows the table view
		default:
			$html ="	<div class='kb_page_wrap'>
							<div class='kb_options_header'>
								" . do_action('kb_admin_notices') . "
							</div>";
			echo $html;

			echo "		<div class='kb_options_section create-new-area'>
							<a href='admin.php?page={$current_screen->parent_base}&action=add-form-dynamic' class='button-primary'>neue Sidebar anlegen</a>
						</div>";

			// Area Table
			echo "<div class='kb_options_section area_table'>";
			echo "<h2>Angelegte Bereiche</h2>";
				$sidebars_table->prepare_items();
				$sidebars_table->display();
				
			echo "<div>";
			echo "</div>";
		break;
	};
}



/*
 * Observe CRUD Actions
 */
function kontentblocks_sidebars_action_switch()
{
	
	if (isset($_GET['page']) && $_GET['page'] == 'kontentblocks-sidebars')
	{
		
		if ( (isset($_REQUEST['action']) && !empty($_REQUEST['action']) ) )
		{
			switch ($_REQUEST['action'])
			{	
				case 'update':
					do_action('kontentblocks-sidebars-update');
				break;

				case 'update-settings':
					do_action('kontentblocks-sidebars-settings-update');
				break;

				case 'delete':
			
					do_action('kontentblocks-sidebars-delete');
				break;
            
                case 'add':
                    do_action('kontentblocks-sidebars-add');
               break;


			}
		}
	}
}


/*
 * Update Callback
 */
function update_area_contents()
{
	
	global $Kontentbox, $Kontentblocks;
	if ( !isset( $_REQUEST['area']) ) die('Something wrong!');
	
	$area_id = $_REQUEST['area'];
	$dynamic_areas = get_option('kb_dynamic_areas');
	
	$blocks = $dynamic_areas[$area_id];
	
		if ( !empty( $blocks ) )
		{
			foreach ( $blocks as $block ) {
				
				// old, saved data
				$old = get_option($block['instance_id']);

				// new data from $_POST
               
				$data = stripslashes_deep( $_POST[$block['instance_id']] );
				
				// check for draft and set to false
				$block['draft'] = $Kontentbox->_draft_check($block);
				
				// special block specific data
				$block = $Kontentbox->_individual_block_data($block, $data);
				
				$dynamic_areas[$area_id][$block['instance_id']] = $block;

				
				// call save method on block
				// if locking of blogs is used, and a block is locked, use old data
				if (KONTENTLOCK && $block['locked'] == 'locked')
				{
					$new = $old;
				}
				else
				{
					$new = $Kontentblocks->blocks[$block['class']]->save( $old, $block['instance_id'], $data );
				}
				

				// store new data in post meta
				if ( $new && $new != $old )
				{
						update_option( $block['instance_id'], $new );
					
				}
				
					update_option ('kb_dynamic_areas', $dynamic_areas);
                    
					
					$tosave[$area_id] = \KBArea::save_custom_area_settings($area_id);
					update_option('kb_dynamic_areas_settings', $tosave);	
			}
			
		}
	
	
	if (isset($_GET['ext']) && $_GET['ext'] == 1)
	{
		$location = add_query_arg(array('message'=>'updated2', 'daction' => 'show', 'action' => 'tb_edit_dynamic_areas'));
	}
	else
	{
		$location = add_query_arg(array('message'=>'updated', 'action' => 'edit'));	
	}
	wp_redirect($location);
}
add_action('kontentblocks-sidebars-update', 'Kontentblocks\Admin\Sidebars\update_area_contents',9999);


/**
 * Add
 */
function add()
{
    
    global $current_screen;
    
		$error = '';
		check_admin_referer('kb_add_area','kb_add_area_nonce');
        $user_id = get_current_user_id();
		$data = (isset($_POST['new_area'])) ? $_POST['new_area'] : array();

		if( empty($data['id']) OR empty($data['name']))
		{

            $location = add_query_arg(array('error'=>'1', 'action' => 'add-form-dynamic'));
            set_transient($user_id . '_error_sidebar_create', $data, 60*2);
            wp_redirect($location);
                    
		}


		elseif (! $error)
		{
			
			$location = "admin.php?page={$current_screen->parent_base}";
			// everything good, save area
			$areas = get_option('kb_registered_areas');
			$dynamic_areas = get_option('kb_dynamic_areas');

			// prepare id
			$sanitized_id = sanitize_title($data['id']);
			$data['id'] = $sanitized_id;
			
			// handle unset checkboxes, we don't want unset vars
			$data['page_template']		= ( ! empty($data['page_template'])) ? $data['page_template'] : array();
			$data['post_type']			= ( ! empty($data['post_type'])) ? $data['post_type'] : array();
			$data['available_blocks']	= ( ! empty($data['available_blocks'])) ? $data['available_blocks'] : array();
			$data['area_templates']		= ( ! empty($data['area_templates'])) ? $data['area_templates'] : array();
			// dynamic flag
			$data['dynamic']			= true;
			$data['context']			= 'side';
			$data['order']				= apply_filters('kb_sidebar_default_order', 10);
			

			$areas[$data['id']] = $data;
			update_option('kb_registered_areas', $areas);
			
			$dynamic_areas[$data['id']] = array();
			update_option('kb_dynamic_areas', $dynamic_areas);

			

			$location = add_query_arg(array('message'=>'3', 'action' => false, 'create' => false));
            wp_redirect($location);
            exit();
		}
}
add_action('kontentblocks-sidebars-add', 'Kontentblocks\Admin\Sidebars\add',9999);

/**
 * Delete Area
 */
function delete_area()
{
	check_admin_referer('delete_area', 'nonce');

	if (isset($_GET['area']))
	{
		$area_id = $_GET['area'];
	}
	else {
		die('Cheatin?');
	}


	$areas = get_option('kb_registered_areas');

	// check if dynamic
	$dynamic = ($areas[$area_id]['dynamic'] == true) ? true : false;
	unset($areas[$area_id]);

	// remove from dynamic areas as well
	if ($dynamic)
	{
		$dynamic_areas = get_option('kb_dynamic_areas');
		unset($dynamic_areas[$area_id]);
		update_option('kb_dynamic_areas', $dynamic_areas);
	}

	update_option('kb_registered_areas', $areas);
	$location = add_query_arg(array('message'=>'2', 'action' => false, 'area' =>false, 'nonce' => false));
	wp_redirect($location);

}
add_action('kontentblocks-sidebars-delete', 'Kontentblocks\Admin\Sidebars\delete_area',1);

/*
 * Update Settings for area
 */
/**
 * Update Area Settings
 */
function update_area()
{
	check_admin_referer('kb_edit_area','kb_edit_area_nonce');
	// prepare & setup new area data
	if (isset($_GET['area']))
	{
		$area_id = $_GET['area'];
		$data = $_POST['new_area'];
	}
	else {
		die('');
	}


	// handle unset checkboxes, we don't want unset vars
	$page_template		= ( ! empty($data['page_template'])) ? $data['page_template'] : array();
	$post_type			= ( ! empty($data['post_type'])) ? $data['post_type'] : array();
	$available_blocks	= ( ! empty($data['available_blocks'])) ? $data['available_blocks'] : array();
	$area_templates		= ( ! empty($data['area_templates'])) ? $data['area_templates'] : array();
	$default_tpl		= ( ! empty($data['default_tpl'])) ? $data['default_tpl'] : '';
	

	$new_area = array
	(
		'id'				=> $area_id,
		'name'				=> $data['name'],
		'description'		=> $data['description'],
		'block_limit'		=> $data['block_limit'],
		'before_area'		=> $data['before_area'],
		'after_area'		=> $data['after_area'],
		'page_template'		=> $page_template,
		'post_type'			=> $post_type,
		'available_blocks'	=> $available_blocks,
		'area_templates'	=> $area_templates,
		'dynamic'			=> ($data['dynamic'] == '1') ? true : false ,
		'default_tpl'		=> $default_tpl,
		'order'				=> $data['order'],
		'belongs_to'		=> $data['belongs_to'],
		'context'			=> $data['context']
	);


	$areas = get_option('kb_registered_areas');
	$areas[$area_id] = $new_area;

	update_option('kb_registered_areas', $areas);

	$location = add_query_arg(array('message'=>'1', 'action' => false));
	wp_redirect($location);
}
add_action('kontentblocks-sidebars-settings-update', 'Kontentblocks\Admin\Sidebars\update_area');