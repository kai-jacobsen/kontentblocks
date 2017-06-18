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

    public function prepareTemplateData($data)
    {
        $options = $this->getArg('options', []);
        if (is_callable($options)) {
            $options = call_user_func($options, $this);

            if (!is_array($options)) {
                $options = [];
            }
            $this->setArgs(array('options' => $options));

        }

        return $data;
    }

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

        $options = $this->getArg('options', []);
        if (is_callable($options)) {
            $options = call_user_func($options, $this);

            if (!is_array($options)) {
                $options = [];
            }
        }


        if ($this->getArg('select2', false) && is_array($val)) {
            $collect = array();

            $toValue = $this->sortToValue($options);

            foreach ($val as $someValue) {
                if (isset($toValue[$someValue])) {
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

    private function sortToValue($options)
    {
        $collect = array();
        foreach ($options as $option) {
            $collect[$option['value']] = $option;
        }
        return $collect;
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
}