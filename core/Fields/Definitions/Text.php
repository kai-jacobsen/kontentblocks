<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Text extends Field
{

    // Defaults
    public static $settings = array(
        'returnObj' => 'Element',
        'type' => 'text'
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
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareOutputValue( $val )
    {
        return wp_kses_post( $val );
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return esc_html( $val );

    }

}