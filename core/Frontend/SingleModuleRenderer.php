<?php

namespace Kontentblocks\Frontend;


use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

class SingleModuleRenderer
{


    public function __construct($Module)
    {
        $this->Module = $Module;


    }

    public function render($args = array())
    {
        $addArgs = $this->setupArgs($args);

        $this->Module->_addAreaAttributes($addArgs);
        printf('<%3$s id="%1$s" class="%2$s">', $this->Module->instance_id, 'os-edit-container module', $addArgs['element']);
        echo $this->Module->module($this->Module->rawModuleData);
        echo "</{$addArgs['element']}>";
        JSONBridge::getInstance()->registerModule($this->Module->toJSON());
    }

    private function setupArgs($args)
    {
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'element' => 'div',
            'action' => null,
            'area_template' => 'default'
        );

        return wp_parse_args($args, $defaults);
    }


}