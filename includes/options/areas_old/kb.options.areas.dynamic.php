<?php
add_action('kb_update_area_dynamic', 'kb_update_area_dynamic_callback',9999);
// handle admin notices

// call this late to ensure kontentblocks setup is done 
add_action('init', 'kb_dynamic_area_optionpage_switch',100);

function kb_dynamic_area_optionpage_switch()
{
	if (isset($_GET['page']) && $_GET['page'] == 'dynamic_areas')
	{
		if ( (isset($_REQUEST['action']) && !empty($_REQUEST['action']) ) )
		{
			switch ($_REQUEST['action'])
			{	
				case 'update':
					do_action('kb_update_area_dynamic');
				break;			
			}
		}
	}
}


function kb_dynamic_areas() 
{
	
	$kb_dynamic_areas_table = new KB_Dynamic_Areas_Overview();
	
	// get action
	$action = ($kb_dynamic_areas_table->current_action());

	switch ($action)
	{	
		case 'edit':
			include plugin_dir_path( __FILE__ ) . 'kb.options.dynamic_areas.edit.php';
		break;
	
		case false:
			global $current_screen;
			$html ="	<div class='kb_page_wrap'>
							<div class='kb_options_header'>
								<div id='icon-options-general' class='icon32'></div>
								<h2>Dynamische Bereiche</h2>
							</div>";
			echo $html;

			// Area Table
			echo "<div class='kb_options_section area_table'>";
			echo "<h2>Angelegte Bereiche</h2>";
				$kb_dynamic_areas_table->prepare_items();
				$kb_dynamic_areas_table->display();
				
			echo "<div>";
			echo "</div>";
		break;
	};
	
}

function kb_update_area_dynamic_callback()
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
					
					$tosave[$area_id] = KBArea::save_custom_area_settings($area_id);
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