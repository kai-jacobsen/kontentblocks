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
    public static $defaults = array(
        'type' => 'fonticonpicker'
    );

    /**
     * Form
     */
    public function form()
    {

        $this->label();
        echo "<input class='kb-fonticonpicker' id='{$this->getFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue()}' />";
        $this->description();

    }

	public function outputFilter($v){
		return $v;
	}

    /**
     * Text Input filter
     * @param string $value
     * @return string filtered
     */
    public function inputFilter( $value )
    {
        return esc_textarea( $value );
//	    return $value;
    }



}