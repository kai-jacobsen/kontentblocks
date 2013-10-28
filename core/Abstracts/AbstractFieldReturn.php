<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceFieldReturn;

abstract class AbstractFieldReturn implements InterfaceFieldReturn
{

    public $value;

    public function __construct( $value )
    {
        $this->value = $value;
        return $this;

    }

    public function getValue()
    {
        return $this->value;

    }

}
