<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;


class Module_Prototype extends Module
{

    public static $defaults = array(
        'public_name' => 'Super Prototype',
        'name' => 'Super Prototype',
        'description' => '',
        'globallyAvailable' => true,
        'asTemplate' => true,
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
        $groupA = $this->Fields->addGroup( 'First', array( 'label' => 'Editor' ) )
            ->addField(
                'editor', 'someeditor', array(
                'label' => 'Label for Text',
                'description' => 'stuff',
                'type' => 'text',
                'text' => 'My first checkbox',
                'areaContext' => array( 'normal' ),
                'std' => 'Lorem Ipsum'
                ))
            ->addField(
                'text', 'headline', array(
                'label' => 'Label for Text',
                'description' => 'stuff',
                'type' => 'text',
                'text' => 'My first checkbox',
                'areaContext' => array( 'normal' ),
                'std' => 'Lorem Ipsum'
            ));

        $groupB = $this->Fields->addGroup( 'Second', array( 'label' => 'Options' ) )
            ->addField(
                'checkbox', 'alternate', array(
                'label' => 'Activate alternative layout',
                'description' => 'This module has an alternative layout',
                'text' => 'My first checkbox',
                'areaContext' => array( 'normal' ),
            ))->addField(
                'checkboxgroup', 'alternateGroup', array(
                'label' => 'Activate alternative layouts options',
                'description' => 'This module has an alternative layout',
                'text' => 'Some options for you buddy',
                'areaContext' => array( 'normal' ),
                'options' => array(
                    array(
                        'value' => 'something',
                        'label' => 'Paint it red'
                    ),
                    array(
                        'value' => 'something',
                        'label' => 'Enter Sandman'
                    ),
                    array(
                        'value' => 'something',
                        'label' => 'Ball Tongue'
                    )
                )
            ));

    }

}
