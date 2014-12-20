<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

/**
 * Advanced datetimepicker based on:
 * http://xdsoft.net/jqplugins/datetimepicker/
 * Additional args are:
 *
 */
Class DateTime extends Field
{

    public static $settings = array(
        'type' => 'datetime'
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
        )}' value='{$this->getValue( 'human' )}' class='kb-datetimepicker' >";
        echo "<input type='hidden' name='{$Form->getFieldName( 'unix' )}' value='{$this->getValue(
            'unix'
        )}' class='kb-datetimepicker--js-unix' >";
        echo "<input type='hidden' name='{$Form->getFieldName( 'sql' )}' value='{$this->getValue(
            'sql'
        )}' class='kb-datetimepicker--js-sql' >";

        if ($this->getValue( 'unix' )) {
            echo "<br><span style='font-size: 10px; color:#ccc; padding:0 8px;'>Unix timestamp: {$this->getValue(
                'unix'
            )}</span>";
        }

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
