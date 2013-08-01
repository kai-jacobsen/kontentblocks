<?php

kb_register_field( 'editor', 'KB_Field_Editor' );

Class KB_Field_Editor extends KB_Field
{

	function __construct()
	{



	}

	function html($key, $args, $data)
	{
		$html = '';
		if ( !empty( $args['label'] ) ) :
			$html = $this->get_label( $key, $args['label'] );
		endif;

		$media = (isset($args['media'])) ? $args['media'] : true;
		$name = $this->get_field_name( $key, $args['array'] );
		$id = $this->get_field_id( $key, true );
		$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];

		ob_start();
		kb_wp_editor( $id, $value, $name, $media );
		$html .= ob_get_clean();

		return $html;
	}




}