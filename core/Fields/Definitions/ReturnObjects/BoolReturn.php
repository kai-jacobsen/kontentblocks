<?php
namespace Kontentblocks\Fields\Definitions\ReturnObjects;


/**
 * Class BoolReturn
 * @package Kontentblocks\Fields\Definitions\ReturnObjects
 */
class BoolReturn extends StandardFieldReturn
{


    /**
     * @param $value
     * @return mixed
     */
    public function prepareValue($value)
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @return bool
     */
    public function isTrue()
    {
        return ($this->value === true);
    }

    /**
     * @return bool
     */
    public function isFalse()
    {
        return ($this->value === false);
    }


}