<?php

kb_register_field( 'textarea', 'KB_Field_Textarea' );

Class KB_Field_Textarea extends KB_Field
{

	function __construct()
	{

		// add_filter('kb_pre_save_field_textarea', array(&$this, 'save_textarea'),10,1);
	}

	function html($key, $args, $data)
	{
		if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );			
		}

		$name = $this->get_field_name( $key, $args['array'] );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$id = $this->get_field_id( $key );
        $value = esc_attr($this->get_value($key, $args, $data));
		$rows = (!empty( $args['rows'] ) ) ? $args['rows'] : '10';

		$html .= "<textarea id='{$id}' name='{$name}' {$class } rows='{$rows}' >{$value}</textarea>";
		
		$html .= $this->get_description($args);
		return $html;
	}

	function save_textarea($data)
	{

		$data = wp_kses_post( $data );

		return $data;
	}

}