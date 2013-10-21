<?php

namespace Kontentfields;

use Kontentfields\Field;

Class FieldText extends Field
{

    protected $args;
    
    public function __construct()
    {

    }
    
    function html( $key, $args, $data )
    {


    }

}

kb_register_field( 'text', 'Kontentfields\FieldText' );
