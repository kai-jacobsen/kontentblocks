<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Customizer\CustomizerIntegration;

Class Medium extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'medium'
    );

    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareFrontendValue( $val )
    {
        return wp_kses_post( $val );
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }


}