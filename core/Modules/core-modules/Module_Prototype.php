<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;

kb_register_block( 'Module_Prototype' );

class Module_Prototype extends Module
{

    public static $defaults = array(
        'public_name' => 'Prototype',
        'description' => '',
        'globallyAvailable' => true,
        'templateable' => true,
        'connect' => 'any',
        'category' => 'media',
        'id' => 'prototype'
    );

    public function render( $data )
    {
        var_dump($this->new_instance);
        $tpl = new ModuleTemplate( $this, '/templates/prototype.twig' );
        return $tpl->render();

    }

    public function fields()
    {

        $groupA = $this->Fields->addGroup( 'Peter' )
            ->addField( 'text', 'key', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test',
                'returnObj' => false
            ) )
            ->addField( 'text', 'keya', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'keys', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'keyq', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'keyw', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'keye', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'keyt', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'key2', array( 'label' => 'stuff', 'arrayKey' => 'test' ) );

        $fieldB = $this->Fields->addGroup( 'Andrew' )
            ->addField( 'text', 'key3', array( 'stuff' => 'stuff' ) );

    }

}
