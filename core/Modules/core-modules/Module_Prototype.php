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
        'id' => 'prototype',
        'controls' => array(
            'width' => 400
        )
    );

    public function render( $data )
    {
        if ( empty( $data ) ) {
            return;
        }

        $para = apply_filters( 'the_content', $this->getData( 'editortext' ) );
//        $img  = wp_prepare_attachment_for_js( $data[ 'stuffing' ][ 'image' ][ 'id' ] );
        $tpl  = new ModuleTemplate( $this, 'prototype.twig', array( 'real' => $para ) );
        return $tpl->render();

    }

    public function fields()
    {
        $groupA = $this->Fields->addGroup( 'Peter', array( 'label' => 'What' ) )
            ->addField(
                'text', 'sometext', array(
                'label' => 'Label for Text',
                'descriptiom' => 'stuff',
                'type' => 'text',
                'text' => 'My first checkbox',
                'areaContext' => array( 'normal', 'side' ),
                'arrayKey' => 'stuffing'
                )
            )
            ->addField(
                'image', 'somecheckimage', array(
                'label' => 'Label for Text',
                'descriptiom' => 'stuff',
                'type' => 'text',
                'text' => 'My first checkbox',
                'areaContext' => array( 'normal' ),
                'std' => true,
                'arrayKey' => 'stuffing'
                )
            )
            ->addField(
            'checkbox', 'somecheckbox', array(
            'label' => 'Label for Text',
            'descriptiom' => 'stuff',
            'type' => 'text',
            'text' => 'My first checkbox',
            'areaContext' => array( 'normal' ),
            'std' => true,
            'arrayKey' => 'stuffing'
            ) );

    }

}
