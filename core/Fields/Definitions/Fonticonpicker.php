<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Fonticonpicker
 *
 */
Class Fonticonpicker extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'fonticonpicker'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<input class='kb-fonticonpicker' id='{$this->getInputFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue()}' />";
        $this->description();
    }


	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	public function prepareFormValue( $val ) {
		return $val;
	}

}