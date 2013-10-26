<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Fields\Returnobjects\FieldReturnInterface;

abstract class FieldReturnObject implements FieldReturnInterface
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
