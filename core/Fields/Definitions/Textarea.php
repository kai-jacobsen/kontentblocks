<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Textarea extends Field
{

	// Defaults
	public static $defaults = array(
		'returnObj' => 'Element',
		'type' => 'textarea'
	);

	/**
	 * Form
	 */
	public function form()
	{
		$this->label();
		echo "<textarea id='{$this->getFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'>{$this->getValue()}</textarea>";
		$this->description();

	}

	/**
	 * Text Input filter
	 * @param string $value
	 * @return string filtered
	 */
	public function inputFilter( $value )
	{
		return esc_attr( $value );

	}

}