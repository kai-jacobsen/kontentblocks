<?php

namespace Kontentblocks\Fields\Returnobjects\Utilities;

use Kontentblocks\Fields\Definitions\ReturnObjects\ImageReturn;

/**
 * Class ImageObject
 * @property mixed classes
 * @package Kontentblocks\Fields
 */
class ImageObject extends ImageReturn
{

    /**
     * ImageObject constructor.
     * @param $value
     */
    public function __construct($value)
    {
        if (!is_array($value) && is_numeric($value)) {
            $value = array('id' => $value);
        }
        $this->value = $this->prepareValue($value);
    }

}