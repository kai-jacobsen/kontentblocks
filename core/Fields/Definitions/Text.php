<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Text extends Field {

	// Defaults
	public static $settings = array(
		'returnObj' => 'Element',
		'type'      => 'text'
	);

	/**
	 * Form
	 */
	public function form() {

		$this->label();
		$type = $this->getArg( 'type', 'text' );
		echo "<input type='{$type}' id='{$this->getInputFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue()}' />";
		$this->description();

	}

	/**
	 * When this data is retrieved
	 * @param $val
	 *
	 * @return string
	 */
	public function prepareOutputValue($val){
		return wp_kses_post($val);
	}


	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareFormValue( $val ) {
		return esc_html($val);

	}



}