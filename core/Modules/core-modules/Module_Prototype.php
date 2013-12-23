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
//        return apply_filters( 'the_content', $this->getData( 'somecheckbox' ) );
        $file = wp_prepare_attachment_for_js( $this->getData( 'id', 'somefile' ) );
        $tpl  = new ModuleTemplate( $this, '/templates/prototype.twig', array( 'file' => $file ) );
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
            'file', 'somefile', array(
            'label' => 'Label for Text',
            'description' => 'Maybe a Description is waht longer than this',
            'type' => 'text',
            'text' => 'My first checkbox',
            'areaContext' => array( 'normal' ),
            'taxonomy' => 'category',
            'jSettings' => array(
                        'format' => 'Y'
            )
            ) );

    }

}
