<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * WP built-in colorpicker
 */
Class Color extends Field
{

    public static $defaults = array(
        'type' => 'color',
        'returnObj' => false
    );


    public function form()
    {
        $this->label();

        echo "<input class='kb-color-picker' type='text' name='{$this->getFieldName()}' id='{$this->getFieldId()}' value='{$this->getValue()}' size='8' />";

        $this->description();

    }

    public function concat($data){
        return false;
    }

}