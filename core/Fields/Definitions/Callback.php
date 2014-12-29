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