<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Select extends Field {

	public static $settings = array(
		'type' => 'select'
	);

	/**
	 * Select field form html
	 */
	public function form() {
		$options = $this->getArg( 'options' );
		if ( !$options ) {
			echo __( 'Please set options to show', 'Kontentblocks' );

			return;
		}

		$this->label();

		print "<select id='{$this->getInputFieldId()}' name='{$this->getFieldName()}'>";

		if ( $this->getArg( 'empty', true ) ) {
			print "<option value='' name=''>Bitte wählen</option>";
		}
		if ( !empty( $options ) ) {

			foreach ( $options as $o ) {
				$selected = selected( $this->getValue(), $o['value'], false );
				print "<option {$selected} value='" . esc_attr( $o['value'] ) . "'>{$o['name']}</option>";
			}
		}

		print "</select>";

		$this->description();

	}

	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	public function prepareFormValue( $val ) {
		if ( is_numeric( $val ) ) {
			return filter_var( $val, FILTER_SANITIZE_NUMBER_INT );
		} else if ( is_string( $val ) ) {
			return filter_var( $val, FILTER_SANITIZE_STRING );
		}

		return null;
	}
}