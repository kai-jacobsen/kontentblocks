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
        $type  = $this->getArg( 'type', 'text' );
        echo "<input type='{$type}' id='{$this->get_field_id()}' name='{$this->get_field_name()}' placeholder='{$this->getPlaceholder()}'  value='{$value}' />";

    }

    public function filter( $value )
    {
        return esc_attr( $value );

    }

}

kb_register_fieldtype( 'text', 'Kontentblocks\Fields\Definitions\Text' );
