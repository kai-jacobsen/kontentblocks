<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Multiselect extends Field
{

    public static $settings = array(
        'type' => 'multiselect',
        'forceSave' => true

    );


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        if (is_null( $val )) {
            return null;
        }
        return $val;
    }

    public function save($new, $old)
    {
        if (!$new) {
            return array();
        }

        return $new;
    }


}