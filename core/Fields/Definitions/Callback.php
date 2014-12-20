<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

/**
 * Custom callback for field content
 * Additional args are:
 *
 */
Class Callback extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'callback',
        'returnObj' => false
    );

    /**
     * Form
     * @param FieldForm $Form
     */
    public function form( FieldForm $Form )
    {
        if (!$this->getArg( 'callback' )) {
            echo "<p>No Callback specified</p>";
        }

        call_user_func_array( $this->getArg( 'callback' ), $this->getArg( 'args', array() ) );

    }

    /**
     * Prevent recursion in json_encode of field args
     * @return array
     */
    public function argsToJson()
    {
        $args = $this->args;
        unset( $args['callback'] );
        return $args;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }
}