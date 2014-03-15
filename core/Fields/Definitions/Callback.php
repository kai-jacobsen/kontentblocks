<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Custom callback for field content
 * Additional args are:
 *
 */
Class Callback extends Field
{

    // Defaults
    public static $defaults = array(
        'type' => 'callback',
        'returnObj' => false
    );

    /**
     * Form
     */
    public function form()
    {
        if (!$this->getArg('callback')) {
            echo "<p>No Callback specified</p>";
        }

        call_user_func_array($this->getArg('callback'), $this->getArg('args', array()));

    }

    public function argsToJson()
    {
        $args = $this->args;
        unset($args['callback']);
        return $args;
    }

}