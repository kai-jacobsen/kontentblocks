<?php

kb_register_field( 'image', 'KB_Field_Image' );

Class KB_Field_Image extends KB_Field
{

	
	
	
	
	function __construct()
	{

		add_action( 'wp_ajax_kb_single_image_get_and_set', array( __CLASS__, 'get_attachment_image' ) );
		add_action( 'wp_ajax_kb_single_image_remove', array( __CLASS__, 'single_image_remove' ) );
		
	}

	
	
	
	
	static function admin_print_styles()
	{
		wp_enqueue_script( 'KBSingleImage', KB_FIELD_JS . 'KBSingleImage_35.js', NULL, true );
	}

	
	
	
	
	function html($key, $args, $data)
	{
		
		$html = '';
		if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );
		}
		
		$html .= $this->get_description($args);

		$name = $this->get_field_name( $key, $args['array'] );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
        $value = $this->get_value($key, $args, $data);

		
		$size = (!empty($args['size'])) ? $args['size'] : array(150,150);
		$src = (!empty( $value )) ? wp_get_attachment_image_src( $value, $size ) : NULL;
		$img = (NULL !== $src) ? "<img src='{$src[0]}' >" : '';

		$remove = (empty( $value )) ? " hide-if-empty " : '';
		
		$removetext = __('Remove image', 'kontentblocks');
		$addtext = (empty( $value )) ? __('Chose Image', 'kontentblocks') : __('Change image','kontentblocks');
		
		$html .= "	<div class='kb-field-image-wrapper clearfix'>
                    <div class='kb-field-image-frame {$class}'>
                    {$img}
                    </div>
                    <div class='kb-field-image-controls'>
                    <a class='kb-add-single-image button-primary' href='#'>{$addtext}</a>
                    <a class='{$remove} kb-remove-single-image' data-id='{$value}' href='#'>{$removetext}</a>
					 <input type='hidden' name='{$name}' value='{$value}' data-key='{$key}' >
                    </div>
					</div>
                   
					
                ";
		return $html;
	}

	
	
	
	
	public function get_attachment_image()
	{
		$id = $_POST['attachment_id'];
		$src = wp_get_attachment_image_src( $id, 'medium' );

		//$post_id = $_POST['post_id'];
		//$blockid = $_POST['blockid'];

		//$meta = get_post_meta( $_POST['post_id'], '_' . $_POST['blockid'], true );
		//$meta[$_POST['key']] = $id;

		// $update = update_post_meta( $post_id, '_' . $blockid, $meta );

		if ( $src )
		{
			$image = "<img src='{$src[0]}' />";
			wp_send_json_success($image);
		}
		else
		{
			wp_send_json_error();
		}

		exit;
	}

	
	
	
	
	public function single_image_remove()
	{
		
		$meta = '';
		$post_id = $_POST['post_id'];
		$blockid = $_POST['blockid'];

		$meta = get_post_meta( $_POST['post_id'], '_' . $_POST['blockid'], true );

		$meta[$_POST['key']] = '';

		$update = update_post_meta( $post_id, '_' . $blockid, $meta );

		if ( $update == true )
		{
			echo 1;
		}
		else
		{
			echo 0;
		}
		exit;
	}
	

}