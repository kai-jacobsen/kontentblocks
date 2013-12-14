<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class Text extends Field
{


    protected $defaults = array(
        'returnObj' => 'Element'
    );


    public function form()
    {
        $value = esc_attr( $this->getValue() );
        $type  = $this->getArg( 'type', 'text' );
        $this->label();
        echo "<input type='{$type}' id='{$this->get_field_id()}' name='{$this->get_field_name()}' placeholder='{$this->getPlaceholder()}'  value='{$value}' />";
        $this->description();

    }


}

kb_register_fieldtype( 'text', 'Kontentblocks\Fields\Definitions\Text' );
