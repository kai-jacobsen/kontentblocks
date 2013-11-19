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
        if (empty($data)){
            return;
        }
        
        $para = apply_filters( 'the_content', $this->getData('editortext') );
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
            'arrayKey' => 'stuffing',
            'areaContext' => array('side', 'normal')
            ) )
            ->addField('text', 'sometext', array(
                'label' => 'Label for Text',
                'descriptiom' => 'stuff',
                'arrayKey' => 'stuffing',
                'areaContext' => array('side')
            ));
        
    }

}
