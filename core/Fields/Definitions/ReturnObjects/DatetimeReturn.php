<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;


/**
 * Class DatetimeReturn
 * @package Kontentblocks\Fields\Definitions\ReturnObjects
 */
class DatetimeReturn extends StandardFieldReturn
{

    public $human;

    public $unix;

    public $sql;

    /**
     * @param $value
     * @return mixed
     */
    public function prepareValue($value)
    {
        $defaults = [
            'human' => '',
            'unix' => '',
            'sql' => ''
        ];

        $value = wp_parse_args($value, $defaults);

        $this->human = $value['human'];
        $this->unix = $value['unix'];
        $this->sql = $value['sql'];
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->human;
    }

}