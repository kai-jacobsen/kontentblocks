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

    public static $defaults = array(
        'type' => 'date'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<input type='text' id='{$this->getFieldId()}' name='{$this->getFieldName( 'human' )}' value='{$this->getValue( 'human' )}' class='kb-datepicker' >";
        echo "<input type='hidden' class='kb-date-machine-format' name='{$this->getFieldName( 'machine' )}' value='{$this->getValue( 'machine' )}' >";
        echo "<input type='hidden' class='kb-date-unix-format' name='{$this->getFieldName( 'unix' )}' value='{$this->getValue( 'unix' )}' >";
        $this->description();

    }

    
}
