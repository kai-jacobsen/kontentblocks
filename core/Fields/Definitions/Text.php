<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Text extends Field
{

    // Defaults
    public static $defaults = array(
        'returnObj' => 'Element',
        'type' => 'text'
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
    public function filter( $value )
    {
        return esc_attr( $value );

    }

}