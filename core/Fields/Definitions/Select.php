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

        if ($this->getArg('select2', false) && is_array($val)) {
            $collect = array();
            $options = $this->getArg('options', array());
            $toValue = $this->sortToValue($options);

            foreach ($val as $someValue){
                if (isset($toValue[$someValue])){
                    $collect[$someValue] = $toValue[$someValue];
                    unset($toValue[$someValue]);
                }
            }

            foreach (array_reverse($collect) as $item) {
                array_unshift($toValue, $item);
            }

            $this->setArgs(array('options' => $toValue));
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

        if (is_null($new)) {
            return null;
        }
        return $new;
    }

    private function sortToValue($options)
    {
        $collect = array();
        foreach ($options as $option) {
            $collect[$option['value']] = $option;
        }
        return $collect;
    }
}