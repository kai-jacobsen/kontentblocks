<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;

/**
 * Fonticonpicker
 *
 */
Class Fonticonpicker extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'fonticonpicker'
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