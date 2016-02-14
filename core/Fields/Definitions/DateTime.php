<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Advanced datetimepicker based on:
 * http://xdsoft.net/jqplugins/datetimepicker/
 * Additional args are:
 *
 */
Class DateTime extends Field
{

    public static $settings = array(
        'type' => 'datetime'
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
