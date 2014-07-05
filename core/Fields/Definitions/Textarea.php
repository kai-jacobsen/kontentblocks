<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Textarea extends Field {

	// Defaults
	public static $settings = array(
		'type'      => 'textarea'
	);

	/**
	 * Form
	 */
	public function form() {
		$this->label();
		echo "<textarea id='{$this->getFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'>{$this->getValue()}</textarea>";
		$this->description();

	}



	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareInputValue( $val ) {
		return esc_textarea($val);
	}

	public function prepareOutputValue($val){
		return wp_kses_post($val);
	}

}