<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Single checkbox renders to boolean true or false
 * Unchecked will always return false instead of NULL
 */
Class Checkbox extends Field
{

    // field defaults
    public static  $defaults = array(
        'type' => 'checkbox',
        'renderHidden' => true,
        'returnObj' => false
    );

    /**
     * Checkbox Form HTML
     */
    public function form()
    {
        $checked = checked( $this->getValue(), true, false );
        $this->label();
        echo "<label><input type='checkbox' id='{$this->getFieldId()}' name='{$this->getFieldName()}'  {$checked} /> {$this->getArg( 'text', 'Please label this checkbox' )}</label>";
        $this->description();

    }

    /**
     * Custom save filter
     * Makes sure that a value is saved even for unchecked fields
     * @param string $data value of key from $_POST data
     * @param string $oldData value of key from saved data
     * @return boolean
     */
    public function save( $data, $oldData )
    {

        if ( filter_var( $data, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ) ) {
            return true;
        }
        else {
            return false;
        }

    }

    /**
     * Custom retrieve filter
     * Makes sure that value is a true boolean
     * @param mixed $var value as saved
     * @return bool
     */
    public function inputFilter( $var )
    {
        return filter_var( $var, FILTER_VALIDATE_BOOLEAN );

    }

}
