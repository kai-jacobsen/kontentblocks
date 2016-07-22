<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormRenderer;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Select extends Field
{

    public static $settings = array(
        'type' => 'select',
        'forceSave' => true,
    );


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        if (is_numeric($val)) {
            return filter_var($val, FILTER_SANITIZE_NUMBER_INT);
        } else if (is_string($val)) {
            return filter_var($val, FILTER_SANITIZE_STRING);
        }

        return $val;
    }

    /**
     * Fields saving method
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed
     */
    public function save($new, $old)
    {
        if ($this->getArg('select2', false)) {
            if (!is_array($new)) {
                $new = array();
            }

            if (is_array($old)) {
                foreach (array_keys($old) as $index) {
                    if (!isset($new[$index])) {
                        $new[$index] = null;
                    }
                }
                return $new;
            }
        }

        if (!$new) {
            return null;
        }

        return $new;
    }
}