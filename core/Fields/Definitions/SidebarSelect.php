<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * WordPress sidebar select
 *
 */
Class SidebarSelect extends Field {

	// Defaults
	public static $settings = array(
		'type'      => 'sidebarselect'
	);

	/**
	 * Form
	 */
	public function form() {

        global $wp_registered_sidebars;
		$this->label();
        print "<select id='{$this->getInputFieldId()}' name='{$this->getFieldName()}'>";

        if ( $this->getArg( 'empty', true ) ) {
            print "<option value='' name=''>Bitte wählen</option>";
        }
        if ( !empty( $wp_registered_sidebars ) ) {
            foreach ( $wp_registered_sidebars as $o ) {
                $selected = selected( $this->getValue(), $o['id'], false );
                print "<option {$selected} value='{$o['id']}'>{$o['name']}</option>";
            }
        }

        print "</select>";
		$this->description();

	}

	/**
	 * When this data is retrieved
	 * @param $val
	 *
	 * @return string
	 */
	public function prepareOutputValue($val){
		return $val;
	}


	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareFormValue( $val ) {
		return $val;

	}



}