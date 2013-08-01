<?php

kb_register_field( 'paragraph', 'KB_Field_Paragraph' );

Class KB_Field_Paragraph extends KB_Field
{

	function html($key, $args, $data)
	{

		$html = '';

		if ( !empty( $args['label'] ) ) :
			$html = $this->get_label( $key, $args['label'] );
		endif;

		$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];

		$html .= "<p>{$value}</p>";

		return $html;
	}

}