<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

Class Code extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'code'
    );


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return esc_textarea($val);
    }

    /**
     * Default output, whenever data is requested for the user facing side
     *
     * @param $val
     *
     * @return mixed
     */
    public function prepareFrontendValue($val)
    {
        return $val;
    }

}