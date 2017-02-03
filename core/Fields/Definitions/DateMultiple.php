<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Customizer\CustomizerIntegration;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class DateMultiple extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'date-multiple',
    );

    public function save($new, $old)
    {
        $new = array_values($new);
        if (is_array($new) && is_array($old)) {
            $nc = count($new);
            $oc = count($old);
            if ($nc < $oc) {
                foreach ($new as $k => $v) {
                    $old[$k] = $v;
                }
                $diff = array_diff_key($old, $new);
                foreach (array_keys($diff) as $index) {
                    $new[$index] = null;
                }
            }


        }
        return $new;
    }

    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareFrontendValue($val)
    {
        return $val;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        if (is_array($val)){
            usort($val, function($a, $b) {
                return (absint($a['unix']) > absint($b['unix'])) ? -1 : 1;
            });
        }

        return $val;
    }


}