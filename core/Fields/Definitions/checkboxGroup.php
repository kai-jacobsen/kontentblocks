<?php
namespace Kontentfields;
use Kontentblocks\Fields\Field;


Class Checkbox_Group extends Field
{

	function __construct()
	{
		
	}

	function html($key, $args, $data)
	{
		
		$defaults = array(
			'label' => '',
			'options' => array(),
			'description' => ''
		);
		
		$args = wp_parse_args($args, $defaults);
		
		$html = '';
		if ( !empty( $args['label'] ) ) :
			$html = $this->get_label( $key, $args['label'] );
		endif;
		
		$html .= $this->get_description($args);
		
		$name = $this->get_field_name( $key, true, $args['akey'], $args['multiple'] );
		$id = $this->get_field_id( $key );

        $value = $this->get_value($key, $args, $data);
		$options = (!empty( $args['options'] ) ) ? $args['options'] : null;

		foreach ( $options as $option )
		{
			$checked = (in_array( $option['value'], (array) $value )) ? 'checked="checked"' : '';
			$html .= "<label>";
			$html .= "<input type='checkbox' name='{$name}' id='{$id}' value='{$option['value']}' {$checked} />{$option['name']}</label><br>";
		}

		
		return $html;
	}

}
kb_register_field( 'checkboxGroup', 'Kontentfields\Checkbox_Group' );