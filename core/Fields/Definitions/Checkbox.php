<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class Checkbox extends Field
{

    protected $defaults = array(
        'renderHidden' => true
    );

    public function form()
    {
        $checked = checked( $this->getValue(), true, false );
        $this->label();
        echo "<label><input type='checkbox' id='{$this->get_field_id()}' name='{$this->get_field_name()}'  {$checked} /> {$this->getArg( 'text', 'Please label this checkbox' )}</label>";
        $this->description();

    }

    public function save( $data, $oldData )
    {
        if ( $data === 'on' || $data == '1' ) {
            return true;
        }
//        elseif ( !is_null( $oldData ) ) {
//            return $oldData;
//        }
        else {
            return false;
        }

    }


    public function filter( $var )
    {
        return filter_var( $var, FILTER_VALIDATE_BOOLEAN );

    }

}

kb_register_fieldtype( 'checkbox', 'Kontentblocks\Fields\Definitions\Checkbox' );
