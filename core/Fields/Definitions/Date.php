<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

/**
 * Simple text input field
 * Additional args are:
 *
 */
Class Date extends Field
{

    public static $settings = array(
        'type' => 'date'
    );

    /**
     * Form
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        $Form->label();
        echo "<input type='text' id='{$Form->getInputFieldId()}' name='{$Form->getFieldName(
            'human'
        )}' value='{$this->getValue( 'human' )}' class='kb-datepicker' >";
        echo "<input type='hidden' class='kb-date-machine-format' name='{$Form->getFieldName(
            'machine'
        )}' value='{$this->getValue( 'machine' )}' >";
        echo "<input type='hidden' class='kb-date-unix-format' name='{$Form->getFieldName(
            'unix'
        )}' value='{$this->getValue( 'unix' )}' >";
        $Form->description();

    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }
}
