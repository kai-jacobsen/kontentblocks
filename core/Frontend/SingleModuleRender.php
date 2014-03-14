<?php

namespace Kontentblocks\Frontend;


use Kontentblocks\Utils\JSONBridge;

class SingleModuleRender
{


    public function __construct($Module)
    {
        $this->Module = $Module;
    }

    public function render()
    {
        printf('<div id="%1$s" class="%2$s">', $this->Module->instance_id, 'os-edit-container module');
        echo $this->Module->module($this->Module->rawModuleData);
        echo "</div>";
        JSONBridge::getInstance()->registerModule($this->Module->toJSON());
    }
}