<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;


class Module_Prototype extends Module
{

    public static $defaults = array(
        'public_name' => 'Super Prototype',
        'name' => 'Super Prototype',
        'description' => 'Some short description',
        'globallyAvailable' => true,
        'asTemplate' => true,
        'connect' => 'any',
        'category' => 'media',
        'id' => 'prototype',
        'controls' => array(
            'width' => 600
        )
    );

    public function render($data)
    {
        $tpl = 'default.twig';
        if ($this->getEnvVar('area_template') === '3-columns') {
            $tpl = '3-columns.twig';
        } else if (!$this->getRawData('testimage')) {
            $tpl = 'textonly.twig';
        } else if ($this->getData('alternate', null, false)) {
            $tpl = 'alternate.twig';
        }


        $tpl = new ModuleTemplate($this, $tpl);
        return $tpl->render();

    }

    public function fields()
    {
        $groupA = $this->Fields->addGroup('First', array('label' => 'Editor'))
            ->addField(
                'text', 'headline', array(
                'label' => 'Label for Text',
                'description' => 'stuff',
                'type' => 'text',
                'text' => 'My first checkbox',
                'areaContext' => array('normal'),
                'std' => 'Lorem Ipsum'
            ))
            ->addField(
                'image', 'testimage', array(
                'label' => 'Label for Text',
                'description' => 'stuff',
                'type' => 'text',
                'text' => 'My first checkbox',
                'areaContext' => array('normal'),
            ));

        $groupB = $this->Fields->addGroup('Second', array('label' => 'Options'))
            ->addField(
                'editor', 'sometext', array(
                'label' => 'Sometext',
                'areaContext' => array('normal'),
            ))
            ->addField(
                'checkbox', 'alternate', array(
                'label' => 'Activate alternative layout',
                'description' => 'This module has an alternative layout',
                'text' => 'My first checkbox',
                'areaContext' => array('normal'),
            ))->addField(
                'color', 'bgcolor', array(
                'label' => 'Background Color',
                'description' => 'Change section bakground color',
                'text' => 'My first color choser',
                'areaContext' => array('normal'),
                'std' => '#f2f2f2'
            ));

    }

}
