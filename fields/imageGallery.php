<?php

kb_register_field( 'imageGallery', 'KB_Field_Image_Gallery' );

Class KB_Field_Image_Gallery extends KB_Field
{

	function __construct()
	{

		add_action( 'wp_ajax_kb_gallery_get_images', array( __CLASS__, 'get_images' ) );
		add_action( 'wp_ajax_kb_gallery_update_image', array( __CLASS__, 'update_image'));
		//add_action( 'wp_ajax_kb_single_image_remove', array( __CLASS__, 'single_image_remove' ) );
		add_filter( 'kb_pre_save_field_image_gallery', array( __CLASS__, 'save_filter' ) );
		add_filter( 'wp_ajax_kb_gallery_get_image_info', array( __CLASS__, 'get_image_info') );
		
	}

	static function admin_print_styles()
	{
		wp_enqueue_script( 'KBImageGallery', KB_FIELD_JS . 'KBImageGallery.js', NULL, true );
	}

	function html($key, $args, $data)
	{
		
		$html = '';
		/*if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );
		}*/

		$name = $this->get_field_name( $key, $args['array'] );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];

		$addtext = (empty( $value )) ? __('Chose Image', 'kontentblocks') : __('Change image','kontentblocks');
		
		
		
		$html .= "	<ul class='kb-field-gallery-wrapper {$class} clearfix'>";

		foreach ($data[$key] as $item)
			$html .= trim(self::_attachment_markup($item['id'], $this->blockid, $key));
		
		$html .= "	</ul>
					<a class='kb-add-gallery-images button-primary' href='#'>{$addtext}</a>
                    <input class='keyref' type='hidden' data-key='{$key}' >
                ";
		return $html;
	}

	
	public function get_images()
	{
		/*if (!isset($_POST['data']))
			wp_send_json_error();*/

		$data			= $_POST;
		
		$blockid		= $data['blockid'];
		$key			= $data['key'];
		
		
		$attachments	= (!empty($data['attachments'])) ? self::_prepare_attachments($data['attachments']) : false;
		if ($attachments)
		{
			$return['status'] = 'success';
			foreach($attachments as $item)
				$return['attachments'][] = trim(self::_attachment_markup($item['id'], $blockid, $key));
			
			wp_send_json($return);
		}
		else
		{
			wp_send_json_error();
		}
		
	}
	
	
	
	
	static function _attachment_markup($id, $blockid, $key)
	{
		$src = wp_get_attachment_thumb_url($id);
		$return = "	<li class='attachment image' data-id='{$id}'>
						<img src='$src' />
						<span class='kb-field-gallery-image-delete'></span>
						<input type='hidden' name='{$blockid}[$key][id][]' value='{$id}' />
					</li>";
		
		return $return;
	}
	
	
	
	/*
	 * Create id array from attachment objects
	 */	
	static function _prepare_attachments($attachments)
	{
		$items = array();
		
		foreach ($attachments as $attachment)
		{
			$items[]['id'] = $attachment['id'];
		}
		
		return $items;
	}
	
	
	/* Save Method
	 * 
	 */
	public static function save_filter($data)
	{

	$items = array();
		if ( !empty( $data ))
			foreach ( $data['id'] as $k => $v ) {
				if ( isset( $data['id'][$k]) && !empty($data['id'][$k]) )
				{
					$items[] = array(
						'id' => $data['id'][$k]
					);
				}
			}
	return $items;
	}
	

}