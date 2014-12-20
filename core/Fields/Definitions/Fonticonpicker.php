<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

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
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        $Form->label();
        echo "<input class='kb-fonticonpicker' id='{$Form->getInputFieldId()}' name='{$Form->getFieldName(
        )}' placeholder='{$Form->getPlaceholder()}'  value='{$this->getValue()}' />";
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