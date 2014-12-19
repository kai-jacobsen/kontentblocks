<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Checkbox Group
 * Multiple Values saved as indexed array
 * This should be used if you expect a simple array of values
 * If you need true relational data you should use the field type 'checkboxset'
 */
Class CheckboxGroup extends Field {

	// Field defaults
	public static $settings = array(
		'renderHidden' => true,
		'returnObj'    => false,
		'forceSave'    => true,
		'type'         => 'checkboxgroup'
	);

	/**
	 * Checkbox Group Form HTML
	 * @throws Exception when options data is invalid
	 */
	public function form() {
		$options = $this->getArg( 'options', array() );
		$this->label();
		foreach ( $options as $item ) {

			if ( !isset( $item['label'] ) OR !isset( $item['value'] ) ) {
				throw new \Exception( 'Provide valid checkbox items. Check your code.Either a value or label is missing' );
			}
			$checked = ( in_array( $item['value'], $this->getValue() ) ) ? 'checked="checked"' : '';
			echo "<div class='kb-checkboxgroup-item'><label><input type='checkbox' id='{$this->getInputFieldId( true )}' name='{$this->getFieldName( true )}' value='{$item['value']}'  {$checked} /> {$item['label']}</label></div>";
		}

		$this->description();

	}

	/**
	 * Make sure we always deal with an array
	 *
	 * @param $val
	 *
	 * @return array
	 */
	public function prepareFormValue( $val ) {
		if ( !is_array( $val ) ) {
			return array();
		}

		return $val;
	}


	/**
	 * Custom save filter
	 *
	 * @param array $fielddata from $_POST
	 * @param array $old as saved
	 *
	 * @return array
	 */
	public function save( $fielddata, $old ) {

		if ( is_null( $fielddata ) ) {
			return null;
		}

		return $fielddata;


	}

}
