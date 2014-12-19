<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * WP built-in colorpicker
 */
Class Color extends Field {

	public static $settings = array(
		'type'      => 'color',
		'returnObj' => false
	);


	public function form() {
		$this->label();

		$value = $this->prepareFormValue( $this->getValue() );
		if ( is_null( $value ) ) {
			echo "<p>Please use either hashed a 3 or 6 digit string. Default value is used.<br></p>";
			$value = $this->getArg( 'std', '#ffffff' );
		}

		echo "<input class='kb-color-picker' type='text' name='{$this->getFieldName()}' id='{$this->getInputFieldId()}' value='{$value}' size='7' />";

		$this->description();

	}

	public function concat( $data ) {
		return false;
	}

	/**
	 * Function copied from 'class-wp-customize-manager and wondered why this is not globally avaliable
	 *
	 * @param $color
	 *
	 * @return null|string
	 */
	public function prepareFormValue( $color ) {
		if ( '' === $color ) {
			return '';
		}

		// 3 or 6 hex digits, or the empty string.
		if ( preg_match( '|^#([A-Fa-f0-9]{3}){1,2}$|', $color ) ) {
			return $color;
		}

		return null;


	}

}