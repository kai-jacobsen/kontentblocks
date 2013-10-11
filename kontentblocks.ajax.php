<?php


require_once 'includes/ajax/kontentblocks.ajax.generate.module.php';


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