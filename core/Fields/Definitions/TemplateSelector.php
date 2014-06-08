<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 *
 */
Class TemplateSelector extends Field
{

    // Defaults
    public static $defaults = array(
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
    public function inputFilter( $value )
    {
//        return esc_attr( $value );
	    return $value;
    }



}