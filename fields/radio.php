<?php

kb_register_field( 'radio', 'KB_Field_Radio' );

Class KB_Field_Radio extends KB_Field
{

	function __construct()
	{
		
	}

	function html($key, $args, $data)
	{
		
		$html = '';
		
		if ( !empty( $args['label'] ) ) :
			$html .= $this->get_label( $key, $args['label'] );
		endif;
		$html .= $this->get_description($args);
		$name = $this->get_field_name( $key );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$id = $this->get_field_id( $key );

        $value = $this->get_value($key, $args, $data);

		$options = (!empty( $args['options'] ) ) ? $args['options'] : null;

		foreach ( $options as $option ) {
			$checked = checked( $option['value'], $value, 0 );
			
			$html .= "<label class='radiooption'><input {$class} type='radio' name='{$name}' id='{$id}_{$option['value']}' value='{$option['value']}' {$checked} /> {$option['name']}</label><br>";
			
			
		}
			
		return $html;
	}

}