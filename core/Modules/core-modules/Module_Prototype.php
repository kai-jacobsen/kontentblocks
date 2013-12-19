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
//        return apply_filters( 'the_content', $this->getData( 'stuffing' )->get( 'somecheckbox' ) );
//        $img  = wp_prepare_attachment_for_js( $data[ 'stuffing' ][ 'image' ][ 'id' ] );
//        $tpl  = new ModuleTemplate( $this, 'prototype.twig', array( 'real' => $para ) );
//        return $tpl->render();

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
            'customtaxonomy', 'somecheckbox', array(
            'label' => 'Label for Text',
            'description' => 'Maybe a Description is waht longer than this',
            'type' => 'text',
            'text' => 'My first checkbox',
            'areaContext' => array( 'normal' ),
            'arrayKey' => 'stuffing',
            'options' => array(
                array(
                    'value' => 1,
                    'label' => 'Hello World'
                ),
                array(
                    'value' => 2,
                    'label' => 'A Dog'
                ),
                array(
                    'value' => 3,
                    'label' => 'Bier'
                )
            ),
            'filter' => false
            ) );

    }

}
