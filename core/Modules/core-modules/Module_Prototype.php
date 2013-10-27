<?php

use Kontentblocks\Modules\Module,
    Kontentblocks\TemplateEngine\ModuleTemplate;

kb_register_block( 'Module_Prototype' );

class Module_Prototype extends Module
{

    public static $defaults = array(
        'public_name' => 'Prototype',
        'description' => '',
        'in_dynamic' => true,
        'templateable' => true,
        'connect' => 'any',
        'category' => 'media',
        'id' => 'prototype'
    );

    public function render($data)
    {
        $tpl = new ModuleTemplate($this, '/templates/prototype.twig');
        return $tpl->render();
    }

    public function fields()
    {

        $groupA = $this->Fields->addGroup( 'Peter' )
            ->addField( 'text', 'key', array(
                'label' => 'stuff',
                'description' => 'My first new description',
                'arrayKey' => 'test'
            ) )
            ->addField( 'text', 'key2', array( 'label' => 'stuff', 'arrayKey' => 'test' ) );

        $fieldB = $this->Fields->addGroup( 'Andrew' )
            ->addField( 'text', 'key3', array( 'stuff' => 'stuff' ) );

    }

    public function __destruct()
    {

        echo "\n" . memory_get_peak_usage();

    }

}
