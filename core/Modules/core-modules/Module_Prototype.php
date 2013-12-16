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
            'width' => 600
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
//            ->addField(
//            'editor', 'sometext', array(
//            'label' => 'Label for Text',
//            'descriptiom' => 'stuff',
//            'type' => 'text',
//            'text' => 'My first checkbox',
//            'arrayKey' => 'stuffing'
//            )
//        )
//            ->addField(
//                'image', 'somecheckimage', array(
//                'label' => 'Label for Text',
//                'descriptiom' => 'stuff',
//                'type' => 'text',
//                'text' => 'My first checkbox',
//                'areaContext' => array( 'normal', 'side' ),
//                'std' => true,
//                'arrayKey' => 'stuffing'
//                )
//            )
            ->addField(
            'color', 'somecheckbox', array(
            'label' => 'Label for Text',
            'description' => 'Maybe a Description is waht longer than this',
            'type' => 'text',
            'text' => 'My first checkbox',
            'areaContext' => array( 'normal' ),
            'arrayKey' => 'stuffing',
            'options' => array(
                array(
                    'value' => 'world',
                    'label' => 'Hello World'
                ),
                array(
                    'value' => 'sekt',
                    'label' => 'A Dog'
                ),
                array(
                    'value' => 'beer',
                    'label' => 'Bier'
                )
            )
            ) );

    }

    public function pageRenderAction( $data )
    {
        d( 'pageRender' );

    }
}
