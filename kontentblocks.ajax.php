<?php

require_once 'includes/ajax/kontentblocks.ajax.generate.module.php';

/**
 * Called when a new Block gets added 
 */
/*add_action( 'wp_ajax_kb_generate_blocks', 'kb_generate_blocks_cb' );
function kb_generate_blocks_cb()
{
	global $Kontentblocks;
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;

	if (!defined('KB_GENERATE'))
		define('KB_GENERATE', true);
		
	
	$post_id = (!empty($_POST['post_id'])) ? $_POST['post_id'] : 0;
	$kb_type = $_POST['kb_type'];
	$kb_count = $_POST['kb_count'];
	$kb_area = $_POST['kb_area'];
	$template = $_POST['template'];
	$master = ($_POST['master'] !== 'false') ? true : false;
	$page_template = $_POST['page_template'];
	$post_type = $_POST['post_type'];
	$duplicate = ($_POST['duplicate'] != 'false') ? $_POST['duplicate'] : false;
	
	$master_ref = ($master) ? $template : false;

	
	
	// get existing KBlocks
	$kb_blocks = get_post_meta( $post_id, 'kb_kontentblocks', true );
	
	// get instance
	
	if ($master)
		$kb_type = 'KB_Master_Module';

		$instance = $Kontentblocks->blocks[$kb_type];
	
	$instance->set(array('page_template' => $page_template, 'post_type' => $post_type));
	
	// current highest id is stored in a hidden field and is taken as base for the new block id
	if ( $kb_count != 0 )
	{
		$kb_blocks_count = $kb_count + 1;
	}
	else
	{
		$kb_blocks_count = 1;
	};
	
	// prepare new block id
	$kb_new_id = 'kb-block-p' . $post_id . '_' . $kb_blocks_count;

	// prepare new block data
	$new_block = array(
		'id' => $instance->id,
		'instance_id' => $kb_new_id,
		'area' => $kb_area,
		'class' => $kb_type,
		'name' => $instance->settings['public_name'],
		'status' => '',
		'draft' => 'true',
		'locked' => 'false',
		'area_context' => '',
		'master'		=> $master,
		'master_ref'		=> $master_ref
	);

	if ($template)
	{
		$tpl = $Kontentblocks->get_block_template($template);
		if ($tpl)
		{
			$new_block['name'] = $tpl['name'];
		}
	}
	$instance->set($new_block);
	// add new block and update 
	$kb_blocks[$kb_new_id] = $new_block;
	$update = update_post_meta( $post_id, 'kb_kontentblocks', $kb_blocks );
	
	//create data for templates
	if ( $template != 'false')
	{
		$master_data = get_option($template);
		update_post_meta($post_id, '_' . $kb_new_id, $master_data);
		
	}
	
	
	if ( $duplicate )
	{
		$master_data = get_post_meta($post_id, '_' . $duplicate, true);
		update_post_meta($post_id, '_' . $kb_new_id, $master_data);
	}

	// make sure that the block only get generated if update was successfuk
	if ( $update == true )
	{
		if (empty($_POST['kbajax']))
		{
			$instance->_render_options();
		}
		else
		{
			ob_start();
			$instance->_render_options(true);
			$html = ob_get_clean();
			
			$response = array
			(
				'id' => $kb_new_id,
				'name' => $instance->settings['public_name'],
				'html' => ($html)
			);
			
			echo wp_send_json($response);
			do_action('block_added', $post_id, $new_block);
		}
		
	}
	else
	{
		echo 'error';
	}
	exit;
}*/

add_action( 'wp_ajax_kb_generate_blocks_dynamic', 'kb_generate_blocks_dynamic_cb' );
function kb_generate_blocks_dynamic_cb()
{
	global $Kontentblocks;
	
	$Kontentblocks->set_post_context(false);
	
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;


	
	$kb_type = $_POST['kb_type'];
	$kb_count = $_POST['kb_count'];
	$kb_area = $_POST['kb_area'];
	$master = ($_POST['master'] !== 'false') ? true : false;
	$template = $_POST['template'];
	$duplicate = ($_POST['duplicate'] != 'false') ? $_POST['duplicate'] : false;
	

	// get existing KBlocks
	$dynamic_areas = get_option('kb_dynamic_areas');
	$dynamic_area_blocks = $dynamic_areas[$kb_area];
	
	// get instance
	
	if ($master)
		$kb_type = 'KB_Master_Module';
	
	
	$instance = $Kontentblocks->blocks[$kb_type];
	
	// current highest id is stored in a hidden field and is taken as base for the new block id
	if ( $kb_count != 0 )
	{
		$kb_blocks_count = $kb_count + 1;
	}
	else
	{
		$kb_blocks_count = 1;
	};
	
	// prepare new block id
	$kb_new_id = 'kb-block-da' . $kb_area . '_' . $kb_blocks_count;

	// prepare new block data
	$new_block = array(
		'id' => $instance->id,
		'instance_id' => $kb_new_id,
		'area' => $kb_area,
		'class' => $kb_type,
		'name' => $instance->settings['public_name'],
		'status' => 'kb_active',
		'draft' => 'true',
		'locked' => 'false',
		'area_context' => 'side',
		'master'		=> $master
	);
	
	if ($template)
	{
		$tpl = $Kontentblocks->get_block_template($template);
		if ($tpl)
		{
			$new_block['name'] = $tpl['name'];
		}
	}
	
	$instance->set($new_block);
	
	
	
	// add new block and update 
	$dynamic_area_blocks[$kb_new_id] = $new_block;
	$dynamic_areas[$kb_area] = $dynamic_area_blocks;
	$update = update_option('kb_dynamic_areas', $dynamic_areas);
	
	//create data for templates
	if ( $template !== 'false' && $master !== false)
	{
		update_option($kb_new_id, $template);
		
	}
	elseif ( $template != 'false')
	{
		$master_data = get_option($template);
		update_option($kb_new_id, $master_data);
		
	}
	
	if ( $duplicate )
	{
		$master_data = get_option($duplicate);
		update_option($kb_new_id, $master_data);
	}

	// make sure that the block only get generated if update was successfuk
	if ( $update == true )
	{
		if (empty($_POST['kbajax']))
		{
			$instance->_render_options( false );
		}
		else
		{
			ob_start();
			$instance->_render_options( false );
			$html = ob_get_clean();
			
			$response = array
			(
				'id' => $kb_new_id,
				'name' => $instance->settings['public_name'],
				'html' => ($html)
			);
			
			echo json_encode($response);
		}
		
	}
	else
	{
		echo 'error';
	}
	exit;
}

add_action( 'wp_ajax_kb_sort_blocks', 'kb_sort_blocks_cb' );

function kb_sort_blocks_cb()
{
	$verification = kb_verify_ajax_nonce();
	if ( false == $verification) exit;
	
	if ( isset( $_POST['data'] ) )
	{
		$new = '';
		$post_id = $_POST['post_id'];
		$data = $_POST['data'];
		$old = get_post_meta( $post_id, 'kb_kontentblocks', true );

        
		foreach ( $data as $area => $v ):

			parse_str( $v, $result );

			foreach ( $result as $k => $v ):

				foreach ( $old as $id => $block ):
                
                    if ( $id === $k)
                        unset($old[$k]);

					if ( $block['area'] == $area && $block['instance_id'] == $k ):
						$new[$block['instance_id']] = $block;
					endif;
				endforeach;
			endforeach;
		endforeach;

        $save = array_merge($old, $new);

		$update = update_post_meta( $post_id, 'kb_kontentblocks', $save );

		if ($update)
			$json['success'] = true;
		else
			$json['success'] = false;
		
	}
}

add_action( 'wp_ajax_kb_sort_blocks_dynamic', 'kb_sort_blocks_dynamic_cb' );

function kb_sort_blocks_dynamic_cb()
{

	$verification = kb_verify_ajax_nonce();
	if ( false == $verification) exit;
	
	if ( isset( $_POST['data'] ) )
	{
		$new = '';
		$area_id = $_POST['area_id'];
		$data = $_POST['data'];
		$dynamic_areas = get_option('kb_dynamic_areas');
		$old = $dynamic_areas[$area_id];

		foreach ( $data as $area => $v ):

			parse_str( $v, $result );
		
			foreach ( $result as $k => $v ):

				foreach ( $old as $block ):

					if ( $block['instance_id'] == $k ):
						$new[$block['instance_id']] = $block;
					endif;
				endforeach;
			endforeach;
		endforeach;

        $dynamic_areas[$area_id] = $new;
		$update = update_option('kb_dynamic_areas', $dynamic_areas );

		if ($update)
			wp_send_json_success ( );
		else
			wp_send_json_error ( );
	}
}

add_action( 'wp_ajax_kb_remove_block', 'kb_remove_callback' );

function kb_remove_callback()
{
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;
	
	$post_id = $_POST['post_id'];
	$block_id = $_POST['block_id'];

	$kontentblocks = get_post_meta( $post_id, 'kb_kontentblocks', true );
	unset( $kontentblocks[$block_id] );
	$delete = delete_post_meta( $post_id, '_' . $block_id );

	$update = update_post_meta( $post_id, 'kb_kontentblocks', $kontentblocks );
	if ( TRUE === $delete && TRUE === $update )
	{
		echo 1;
	}
	elseif ( false == $delete && true == $update)
	{
		echo 2;
	}
	else
	{
		echo 0;
	}
	exit;
}

add_action( 'wp_ajax_kb_remove_block_dynamic', 'kb_remove_dynamic_callback' );

function kb_remove_dynamic_callback()
{
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;
	
	$area_id = $_POST['area_id'];
	$block_id = $_POST['block_id'];

	$dynamic_areas = get_option('kb_dynamic_areas');
	unset($dynamic_areas[$area_id][$block_id]);
	$delete = delete_option( $block_id );

	$update = update_option('kb_dynamic_areas', $dynamic_areas);
	if ( TRUE === $delete && TRUE === $update )
	{
		echo 1;
	}
	elseif ( false == $delete && true == $update)
	{
		echo 2;
	}
	else
	{
		echo 0;
	}
	exit;
}

add_action( 'wp_ajax_kb_change_status', 'kb_change_status_callback' );

function kb_change_status_callback()
{
	
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;
	
	$post_id = $_POST['post_id'];
	$block_id = $_POST['block_id'];
	$kontentblocks = get_post_meta( $post_id, 'kb_kontentblocks', true );
	$kb_status = $kontentblocks[$block_id]['status'];

	if ( empty( $kb_status ) || $kb_status == 'kb_active' )
	{
		$kontentblocks[$block_id]['status'] = 'kb_inactive';
		$msg = 1;
	}
	else
	{
		$kontentblocks[$block_id]['status'] = 'kb_active';
		$msg = 2;
	}
	$update = update_post_meta( $post_id, 'kb_kontentblocks', $kontentblocks );
	if ( $update )
	{
		echo $msg;
	}
	exit;
}

add_action( 'wp_ajax_kb_change_status_dynamic', 'kb_change_status_dynamic_callback' );

function kb_change_status_dynamic_callback()
{
	
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;
	$area_id = $_POST['area_id'];
	$block_id = $_POST['block_id'];
	$kontentblocks = get_option('kb_dynamic_areas');
	$kb_status = $kontentblocks[$area_id][$block_id]['status'];

	if ( empty( $kb_status ) || $kb_status == 'kb_active' )
	{
		$kontentblocks[$area_id][$block_id]['status'] = 'kb_inactive';
		$msg = 1;
	}
	else
	{
		$kontentblocks[$area_id][$block_id]['status'] = 'kb_active';
		$msg = 2;
	}
	$update = update_option( 'kb_dynamic_areas', $kontentblocks );
	if ( $update )
	{
		echo $msg;
	}
	exit;
}

add_action( 'wp_ajax_kb_lock_block', 'kb_block_lock_callback' );

function kb_block_lock_callback()
{
	
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;
	
	$post_id = $_POST['post_id'];
	$block_id = $_POST['block_id'];
	$kontentblocks = get_post_meta( $post_id, 'kb_kontentblocks', true );
	$kb_status = $kontentblocks[$block_id]['locked'];

	if ( empty( $kb_status ) || $kb_status == 'false' )
	{
		$kontentblocks[$block_id]['locked'] = 'true';
		$msg = 1;
	}
	else
	{
		$kontentblocks[$block_id]['locked'] = 'false';
		$msg = 2;
	}
	$update = update_post_meta( $post_id, 'kb_kontentblocks', $kontentblocks );
	if ( $update )
	{
		echo $msg;
	}
	exit;
}

add_action( 'wp_ajax_kb_save_area', 'kb_save_area_callback' );

function kb_save_area_callback()
{
	
	$verification = kb_verify_ajax_nonce();
	if (true !== $verification) exit;
	
	$post_id = $_POST['post_id'];
	$block_id = $_POST['block_id'];
	$area_id = $_POST['area_id'];
	$kontentblocks = get_post_meta( $post_id, 'kb_kontentblocks', true );

	$kontentblocks[$block_id]['area'] = $area_id;
	update_post_meta( $post_id, 'kb_kontentblocks', $kontentblocks );
	wp_send_json_success();
	exit;
}



function kb_verify_ajax_nonce()
{
	if (empty($_POST['_kb_nonce']))
	{
		echo 'nonce unset';
		return false;
		exit;
	} 
	elseif (! empty($_POST['_kb_nonce']) )
	{
		
		if (!wp_verify_nonce($_POST['_kb_nonce'], 'kontentblocks_ajax_magic') )
		{
			echo 'wrong nonce';
			return false;
			exit;
		}
		else
		{
			return true;
		}
	}
}
?>