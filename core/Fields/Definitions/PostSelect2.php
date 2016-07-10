<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Prebuild select field to chose one entry from a given post type
 */
Class PostSelect2 extends Field
{

    public static $settings = array(
        'type' => 'postselect2'
    );


    public function prepareTemplateData( $data )
    {
        return $data;
    }

    /**
     * @param $val
     *
     * @return int post ID
     */
    public function prepareFormValue( $val )
    {
        return absint( $val );
    }

    /**
     * @param $val
     *
     * @return int post ID
     */
    public function prepareFrontendValue( $val )
    {
        return absint( $val );
    }
}