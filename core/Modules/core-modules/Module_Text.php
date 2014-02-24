<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\Templating\ModuleTemplate;


class Module_Text extends Module
{

    public static $defaults = array(
        'public_name' => 'WYSIWYG',
        'name' => 'Text Editor',
        'description' => 'Some short description',
        'globallyAvailable' => true,
        'asTemplate' => true,
        'connect' => array('normal', 'side'),
        'id' => 'wysiwyg',
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
