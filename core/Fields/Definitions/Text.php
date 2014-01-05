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
    protected $defaults = array(
        'returnObj' => 'Element'
    );

    /**
     * Form
     */
    public function form()
    {
        $type = $this->getArg( 'type', 'text' );
        echo "<input type='{$type}' id='{$this->get_field_id()}' name='{$this->get_field_name()}' placeholder='{$this->getPlaceholder()}'  value='{$this->getValue()}' />";

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

// register
kb_register_fieldtype( 'text', 'Kontentblocks\Fields\Definitions\Text' );