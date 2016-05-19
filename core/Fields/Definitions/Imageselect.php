<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Imageselect extends Field
{

    public static $settings = array(
        'type' => 'imageselect'
    );


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        if (is_numeric( $val )) {
            return filter_var( $val, FILTER_SANITIZE_NUMBER_INT );
        } else if (is_string( $val )) {
            return filter_var( $val, FILTER_SANITIZE_STRING );
        }

        return null;
    }
}