<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\TemplateEngine\ModuleTemplate;

kb_register_block( 'Module_Prototype' );

class Module_Prototype extends Module
{

    function __construct()
    {
        $args = array(
            'public_name' => 'Prototype',
            'description' => '',
            'in_dynamic' => true,
            'templateable' => true,
            'connect' => 'any',
            'category' => 'media'
        );

        parent::__construct( 'prototype', 'Prototype', $args );

    }

    function options( $data )
    {
        
    }

    function block( $data )
    {
        
    }

    function save( $old, $id, $data )
    {
        
    }

}
