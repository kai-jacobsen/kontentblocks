<?php

kb_register_field( 'imageSize', 'KB_Image_Size' );

Class KB_Image_Size extends KB_Field
{

	function __construct()
	{
		
	}

	function html($key, $args, $data)
	{
		$selected = false;
		$html = '';
		
		if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );
		}
		$name = $this->get_field_name( $key );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$id = $this->get_field_id( $key );
		$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];
		$options = get_intermediate_image_sizes();




		$html .= "<select {$class} id='{$id}' name='{$name}'>";

		foreach ( $options as $option ) {
			$selected = selected( $value, $option, false );
			$html .= "<option {$selected} value='{$option}'>{$option}</option>";
		}

		$html .= "</select>";

		return $html;
	}

}