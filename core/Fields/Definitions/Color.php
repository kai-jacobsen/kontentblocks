<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * WP built-in colorpicker
 */
Class Color extends Field
{

    public static $settings = array(
        'type' => 'color'
    );


    public function concat( $data )
    {
        return false;
    }

    /**
     * @param $data
     * @return mixed
     */
    public function prepareTemplateData( $data )
    {
        $error = false;
        if (is_null( $this->getValue(null,null) )) {
            $error = "<p>Please use either hashed a 3 or 6 digit string. Default value is used.<br></p>";
            $this->setData( $this->getArg( 'std', '#ffffff' ) );
        }
        $data['error'] = $error;
        return $data;
    }

    /**
     * Function copied from 'class-wp-customize-manager and wondered why this is not globally avaliable
     *
     * @param $color
     *
     * @return null|string
     */
    public function prepareFormValue( $color )
    {
        if ('' === $color) {
            return null;
        }

        // 3 or 6 hex digits, or the empty string.
        if (preg_match( '|^#([A-Fa-f0-9]{3}){1,2}$|', $color )) {
            return $color;
        }

        return null;


    }

}