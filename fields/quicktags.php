<?php

kb_register_field( 'quicktags', 'KB_Field_Quicktags' );

Class KB_Field_Quicktags extends KB_Field
{

	function __construct()
	{

		// add_filter('kb_pre_save_field_textarea', array(&$this, 'save_textarea'),10,1);
	}
	
	static function admin_print_styles()
	{
	wp_enqueue_script( 'KBQuicktags', KB_FIELD_JS . 'KBQuicktags.js', array('quicktags'), true );
	}

	function html($key, $args, $data)
	{
		
		$html = '';
		if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );			
		}

		$name = $this->get_field_name( $key );
		$class = 'quicktags-textarea';
		$id = $this->get_field_id( $key );
		$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];
		$rows = (!empty( $args['rows'] ) ) ? $args['rows'] : '10';

		$html .= "<textarea id='{$id}' name='{$name}' class='{$class }' rows='{$rows}' >{$value}</textarea>";
		return $html;
	}

	function save_textarea($data)
	{

		$data = wp_kses_post( $data );

		return $data;
	}

}