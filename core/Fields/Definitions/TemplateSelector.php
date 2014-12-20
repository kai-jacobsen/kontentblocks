<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

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
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        $Form->label();
        $type = $this->getArg( 'type', 'text' );
        echo "<input type='{$type}' id='{$Form->getInputFieldId()}' name='{$Form->getFieldName(
        )}' placeholder='{$Form->getPlaceholder()}'  value='{$this->getValue()}' />";
        $Form->description();

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
    public function prepareFormValue( $val )
    {
        return $val;
    }
}