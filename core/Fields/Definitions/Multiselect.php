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
        'renderHidden' => true,
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
        if (is_null($val)) {
            return null;
        }
        return $val;
    }

    public function save($new, $old)
    {
        if (!is_array($new)){
            $new = array();
        }

        if (is_array($old)) {
            foreach ($old as $index => $val) {
                if (!isset($new[$index])){
                    $new[$index] = null;
                }
            }
        return $new;
        }


        if (!$new) {
            return null;
        }

        return $new;
    }


}