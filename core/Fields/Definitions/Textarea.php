<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Textarea extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'textarea'
    );


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return esc_textarea( $val );
    }

    /**
     * Default output, whenever data is requested for the user facing side
     *
     * @param $val
     *
     * @return mixed
     */
    public function prepareFrontendValue( $val )
    {
        if (!$this->getArg( 'safe', false )) {
            return wp_kses_post( $val );
        } else {
            return $val;
        }
    }

}