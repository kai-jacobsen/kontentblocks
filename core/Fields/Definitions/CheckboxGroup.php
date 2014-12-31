<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

/**
 * Checkbox Group
 * Multiple Values saved as indexed array
 * This should be used if you expect a simple array of values
 * If you need true relational data you should use the field type 'checkboxset'
 */
Class CheckboxGroup extends Field
{

    // Field defaults
    public static $settings = array(
        'renderHidden' => true,
        'returnObj' => false,
        'forceSave' => true,
        'type' => 'checkboxgroup'
    );



    /**
     * Make sure we always deal with an array
     *
     * @param $val
     *
     * @return array
     */
    public function prepareFormValue( $val )
    {
        if (!is_array( $val )) {
            return array();
        }

        return $val;
    }


    /**
     * Custom save filter
     *
     * @param array $fielddata from $_POST
     * @param array $old as saved
     *
     * @return array
     */
    public function save( $fielddata, $old )
    {

        if (is_null( $fielddata )) {
            return null;
        }
        return $fielddata;
    }

    /**
     * @param FieldForm $Form
     */
    public function renderHidden( FieldForm $Form )
    {
        $value = $this->getValue();
        if (is_array( $value ) && !empty( $value )) {
            foreach ($value as $item) {
                echo "<input type='hidden' name='{$Form->getFieldName( true )}' value='{$item}' >";
            }
        }
    }

}
