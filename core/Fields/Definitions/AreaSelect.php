<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;

/**
 * WordPress sidebar select
 *
 */
Class AreaSelect extends Field {

	// Defaults
	public static $settings = array(
		'type'      => 'areaselect'
	);

	/**
	 * Form
	 */
	public function form() {

        /** @var \Kontentblocks\Backend\Areas\AreaRegistry $Registry */
        $Registry = Kontentblocks::getService('registry.areas');
        $areas = $Registry->getGlobalAreas();
		$this->label();
        print "<select id='{$this->getInputFieldId()}' name='{$this->getFieldName()}'>";

        if ( $this->getArg( 'empty', true ) ) {
            print "<option value='' name=''>Bitte wählen</option>";
        }
        if ( !empty( $areas ) ) {
            foreach ( $areas as $o ) {
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