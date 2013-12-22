<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Date extends Field
{
    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<input type='text' id='{$this->get_field_id()}' name='{$this->get_field_name( 'human' )}' value='{$this->getValue( 'human' )}' class='kb-datepicker' >";
        echo "<input type='hidden' class='kb-date-machine-format' name='{$this->get_field_name( 'machine' )}' value='{$this->getValue( 'machine' )}' >";
        echo "<input type='hidden' class='kb-date-unix-format' name='{$this->get_field_name( 'unix' )}' value='{$this->getValue( 'unix' )}' >";
        $this->description();

    }

    
}

// register
kb_register_fieldtype( 'date', 'Kontentblocks\Fields\Definitions\Date' );
