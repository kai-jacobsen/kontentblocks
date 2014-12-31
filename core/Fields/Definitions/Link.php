<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldForm;
use Kontentblocks\Language\I18n;

/**
 * WordPress Link dialog based input field
 * Additional args are:
 *
 */
Class Link extends Field
{

    // Defaults
    public static $settings = array(
        'returnObj' => false,
        'type' => 'link'
    );


    /**
     * @param array $val
     *
     * @return array
     */
    public function prepareFormValue( $val )
    {
        $defaults = array(
            'link' => '',
            'linktext' => '',
            'linktitle' => ''
        );

        $data = wp_parse_args( $val, $defaults );

        $data['link'] = esc_url( $data['link'] );
        $data['linktext'] = esc_html( $data['linktext'] );
        $data['linktitle'] = esc_html( $data['linktitle'] );

        return $data;
    }

}