<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;

/**
 * Simple text input field
 * Additional args are:
 *
 */
Class Date extends Field
{

    public static $settings = array(
        'type' => 'date'
    );


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
