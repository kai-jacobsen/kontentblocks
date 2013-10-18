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
        $this->Fields->render();
    }

    function block( $data )
    {
        
    }

    function save( $old, $id, $data )
    {
        
    }

    function fields()
    {

        $groupA = $this->Fields->addGroup( 'Peter' )
            ->addField( 'type', 'key', array( 'stuff' => 'stuff' ) )
            ->addField( 'type', 'key2', array( 'stuff' => 'stuff' ) );

        $fieldB = $this->Fields->addSingleField('Andrew')
            ->addField('text', 'key3', array( 'stuff' => 'stuff' ) );
        
        
        

    }

}
