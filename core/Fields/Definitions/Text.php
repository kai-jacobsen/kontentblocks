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
        echo "<input type='text' id='{$this->get_field_id()}' name='{$this->get_field_name()}'  value='{$this->getValue()}' />";
    }

}

kb_register_field2( 'text', 'Kontentblocks\Fields\Definitions\Text' );