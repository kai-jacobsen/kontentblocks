<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;

/**
 * Prebuild select field to chose one entry from a given set of options
 */
Class Multiselect extends Field
{

    public static $settings = array(
        'type' => 'multiselect'
    );


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return $val;
    }

    public function save($new, $old)
    {
        return $new;
    }


}