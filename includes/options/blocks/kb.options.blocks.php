<?php

//TODO: Callbacks need nonce verification

// Function Callbacks for different actions

add_action('kb_disable_block', 'kb_disable_block_callback', 10);
add_action('kb_enable_block', 'kb_enable_block_callback', 10);
add_action('kb_bulk_disable_block', 'kb_bulk_disable_block_callback',10);
add_action('kb_bulk_enable_block', 'kb_bulk_enable_block_callback',10);
add_action('kb_update_block', 'kb_update_block_callback',10);
add_action('kb_reset_block', 'kb_reset_block_callback',10);
add_action('kb_bulk_reset_block', 'kb_bulk_reset_block_callback',10);

// make sure wordpress is loaded until calling wp_redirect
add_action('init', 'kb_blocks_optionpage_switch');

// Page Switch
function kb_blocks_optionpage_switch()
{
	if (isset($_GET['page']) && $_GET['page'] == 'blocks')
	{
		if ( (isset($_REQUEST['action']) && !empty($_REQUEST['action']) ) )
		{
			$action = ($_REQUEST['action'] == '-1') ? $_REQUEST['action2'] : $_REQUEST['action'];
			
			switch ($action)
			{

			case 'update':
				do_action('kb_update_block');
			break;

			case 'disable':
				do_action('kb_disable_block');
			break;

			case 'enable':
				do_action('kb_enable_block');
			break;
		
			case 'reset':
				do_action('kb_reset_block');
			break;

			case 'bulk-disable':
				do_action('kb_bulk_disable_block');
			break;

			case 'bulk-enable':
				do_action('kb_bulk_enable_block');
			break;
		
			case 'bulk-reset':
				do_action('kb_bulk_reset_block');
			break;
			}
		}
	}
}


/**
 * This is the callback as specified in the add_submenu_function
 * 
 * This handles the overview and edit page 
 */
function kb_blocks_overview()
{
	// instantiate the WP_List_Table extend
	$kb_blocks_table = new KB_Blocks_Overview();
	
	// get current action
	$action = $kb_blocks_table->current_action();
	
	
	switch ($action)
	{
		// no action soecified, show the table
		case false:
			$html = "<div class='kb_page_wrap'>
						<div class='kb_options_header'>
							<div id='icon-options-general' class='icon32'></div>
							<h2>Kontentblocks Blocks</h2>
						</div>
					";
			echo $html;
			echo "<form action='' method='post' >";
				$kb_blocks_table->prepare_items();
				$kb_blocks_table->display();	
			echo "</form>";
			echo "</div>";
		break;

		// show the edit form
		case 'edit':
			include plugin_dir_path( __FILE__ ) . 'kb.options.blocks.edit.php';
		break;				
	}	
}

/**
 * Update Block Callback 
 */
function kb_update_block_callback(){
	
	if (isset($_GET['block']))
	{
		$block_id = $_GET['block'];
		$data = $_POST['new_block'];
	}
	else {
		die('');
	}
	
	//checkboxes, if not set the should have a value to store anyway
	$wrapper = ( ! empty($data['wrapper'])) ? $data['wrapper'] : '';
	$disable = ( ! empty($data['disable'])) ? $data['disable'] : '';
	
	
	$new_block = array
	(
		'id'			=> $block_id,
		'public_name'	=> $data['public_name'],
		'description'	=> $data['description'],
		'disable'		=> $disable,
		'wrapper'		=> $wrapper,
		'before_block'	=> $data['before_block'],
		'after_block'	=> $data['after_block']
	);
			
	$blocks = get_option('kb_block_options');
	$blocks[$block_id] = $new_block;
	
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '7', 'action' => false, 'block' => false));
	wp_redirect($location);
}

/**
 * Disable single Block callback 
 */
function kb_disable_block_callback()
{
	$block_id = $_GET['block'];
	
	$blocks = get_option('kb_block_options');
	
	$blocks[$block_id]['disable'] = 'disable';
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '1', 'action' => false, 'block' => false));
	wp_redirect($location);
}

/**
 * Enable single Block 
 */
function kb_enable_block_callback()
{
	$block_id = $_GET['block'];
	
	$blocks = get_option('kb_block_options');
	
	$blocks[$block_id]['disable'] = '';
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '2', 'action' => false, 'block' => false));
	wp_redirect($location);
}

/**
 * Reset single Block 
 */
function kb_reset_block_callback()
{
	$block_id = $_GET['block'];
	
	$blocks = get_option('kb_block_options');
	
	unset($blocks[$block_id]);
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '2', 'action' => false, 'block' => false));
	wp_redirect($location);
}

/**
 * Bulk Reset 
 */
function kb_bulk_reset_block_callback()
{
	$selected = $_POST['block'];
	if ( empty($selected))
	{
		$location = add_query_arg(array('message' => '5'));
		wp_redirect($location);
	}
	
	$blocks = get_option('kb_block_options');
	
	foreach ($selected as $block_id)
	{
		unset($blocks[$block_id]);
	}
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '3', 'action' => false, 'block' => false));
	wp_redirect($location);
}

/**
 * Bulk Disable 
 */
function kb_bulk_disable_block_callback()
{
	$selected = $_POST['block'];
	if ( empty($selected))
	{
		$location = add_query_arg(array('message' => '5'));
		wp_redirect($location);
	}
	
    $blocks = get_option('kb_block_options');
	
	foreach ($selected as $block_id)
	{
		$blocks[$block_id]['disable'] = 'disable';
	}
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '3', 'action' => false, 'block' => false));
	wp_redirect($location);
	
}

/**
 * Bulk Enable 
 */
function kb_bulk_enable_block_callback()
{
	$selected = $_POST['block'];
	if ( empty($selected))
	{
		$location = add_query_arg(array('message' => '6'));
		wp_redirect($location);
	}
	
    $blocks = get_option('kb_block_options');
	
	foreach ($selected as $block_id)
	{
		$blocks[$block_id]['disable'] = '';
	}
	update_option('kb_block_options', $blocks);
	
	$location = add_query_arg(array('message' => '4', 'action' => false, 'block' => false));
	wp_redirect($location);
	
}