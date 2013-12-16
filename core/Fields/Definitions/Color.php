<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class Color extends Field
{

    public function form()
    {
        $this->label();

        echo "<input class='kb-color-picker' type='text' name='{$this->get_field_name()}' id='{$this->get_field_id()}' value='{$this->getValue()}' size='8' />";

        $this->description();

    }



}

kb_register_fieldtype( 'color', 'Kontentblocks\Fields\Definitions\Color' );
