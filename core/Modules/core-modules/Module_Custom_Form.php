<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;


class Module_Custom_Form extends Module
{

    public static $defaults = array(
        'publicName' => 'Custom Form',
        'name' => 'Custom Form',
        'description' => 'Some short description',
        'globallyAvailable' => false,
        'asTemplate' => false,
        'hidden' => true,
        'id' => 'custom-form',
        'controls' => array(
            'width' => 600
        )
    );

    public function render($data)
    {
        $tpl = 'normal.twig';
        $tpl = new ModuleTemplate($this, $tpl);
        return $tpl->render();

    }

    public function fields()
    {

        $groupB = $this->Fields->addGroup('Second', array('label' => 'Options'))
            ->addField(
                'editor', 'sometext', array(
                'label' => 'Sometext',
                'areaContext' => array('normal','side'),
                'media' => true,
                'returnObj' => 'Element'
            ));

    }

}
