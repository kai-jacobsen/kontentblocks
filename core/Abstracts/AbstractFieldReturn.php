<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceFieldReturn;

abstract class AbstractFieldReturn implements InterfaceFieldReturn
{

    public $value;

    public function __construct( $value )
    {
        $this->value = $value;

    }

    public function getValue($arraykey = null)
    {

        if (is_array($this->value) && !is_null($arraykey)){
            if (isset($this->value[$arraykey])){
                return $this->value[$arraykey];
            }
        }

        return $this->value;

    }

    public function __toString()
    {
        return $this->value;
    }

}
