<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;

kb_register_block( 'Module_Prototype' );

class Module_Prototype extends Module
{

    public static $defaults = array(
        'public_name' => 'Prototype',
        'name' => 'Prototype',
        'description' => '',
        'globallyAvailable' => true,
        'templateable' => true,
        'connect' => 'any',
        'category' => 'media',
        'id' => 'prototype'
    );

    public function render( $data )
    {

        $para = apply_filters( 'the_content', $data[ 'editortext' ] );
        $img  = wp_prepare_attachment_for_js( $data[ 'stuffing' ][ 'image' ][ 'id' ] );
        $tpl  = new ModuleTemplate( $this, '/templates/prototype.twig', array( 'real' => $para, 'img' => $img ) );
        return $tpl->render();

    }

    public function fields()
    {

        $groupA = $this->Fields->addGroup( 'Peter', array('label' => 'What') )
            ->addField( 'image', 'image', array(
            'label' => 'stuff',
            'description' => 'My first image',
            'arrayKey' => 'stuffing'
            ) );
        $groupB = $this->Fields->addGroup( 'Klaus' )
            ->addField( 'editor', 'editortext', array(
            'label' => 'stuff',
            'description' => 'My first new description',
            'media' => true
            ) );

    }

}
