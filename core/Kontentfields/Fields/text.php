<?php

namespace Kontentfields;

use Kontentblocks\Fields\Field;

Class FieldText extends Field
{

    protected $args;
    
    public function __construct()
    {
        echo "'Hello";

    }
    
    function html( $key, $args, $data )
    {


    }

}

kb_register_field( 'text', 'Kontentfields\FieldText' );
