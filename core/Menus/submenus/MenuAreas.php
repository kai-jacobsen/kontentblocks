<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;

class MenuAreas extends AbstractMenuEntry
{
    public static $args = array(
        'handle' => 'kontentblocks-areas',
        'name' => 'Areas',
        'priority' => 20
    );

    public function __construct(){

        //todo parse defaults
        foreach (self::$args as $k => $arg){
            $this->$k = $arg;
        }

    }

    public function title()
    {
        // TODO: Implement title() method.
    }
}