<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 *
 */
Class TemplateSelector extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'templateSelector'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        $type = $this->getArg( 'type', 'text' );
        echo "<input type='{$type}' id='{$this->getFieldId()}' name='{$this->getFieldName()}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue()}' />";
        $this->description();

    }

    /**
     * Text Input filter
     * @param string $value
     * @return string filtered
     */
    public function getPublicFilter( $value )
    {
//        return esc_attr( $value );
	    return $value;
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