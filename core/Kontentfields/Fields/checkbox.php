<?php
namespace Kontentfields;
use Kontentfields\Field;

Class Checkbox extends Field
{


	function html($key, $args, $data)
	{

		$html = '';

		if ( !empty( $args['label'] ) )
		{
			$html = $this->get_label( $key, $args['label'] );
		}
		$html .= $this->get_description($args);

		$checked = checked( !empty( $data[$key] ), true, false );
		$name = $this->get_field_name( $key );
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$id = $this->get_field_id( $key );
		$text = (!empty( $args['text'])) ? $args['text'] : '';
		//$value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];


		$html .= "<label><input type='checkbox' {$class} id='{$id}' name='{$name}' {$checked} /> {$text}</label>";

		return $html;
	}

}
kb_register_field( 'checkbox', 'Kontentfields\Checkbox' );