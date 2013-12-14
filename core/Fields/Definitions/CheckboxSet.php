<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class CheckboxSet extends Field
{

    public function form()
    {

    }

}

kb_register_fieldtype( 'checkboxset', 'Kontentblocks\Fields\Definitions\CheckboxSet' );
