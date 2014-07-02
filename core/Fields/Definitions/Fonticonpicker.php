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
        echo "<input class='kb-fonticonpicker' id='{$this->getFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue()}' />";
        $this->description();

    }

	public function setFilter($v){
		return $v;
	}

    /**
     * Text Input filter
     * @param string $value
     * @return string filtered
     */
    public function getPublicFilter( $value )
    {
        return esc_textarea( $value );
//	    return $value;
    }

	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareInputValue( $val ) {
		return $val;
	}



}