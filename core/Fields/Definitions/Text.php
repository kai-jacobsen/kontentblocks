<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;
use Kontentblocks\Panels\CustomizerIntegration;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Text extends Field
{

    // Defaults
    public static $settings = array(
        'returnObj' => 'Element',
        'type' => 'text'
    );

    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareOutputValue( $val )
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
        return esc_html( $val );

    }

    public function addCustomizerControl( \WP_Customize_Manager $customizeManager, CustomizerIntegration $integration )
    {
        $customizeManager->add_control(
            $integration->getSettingName( $this ),
            array(
                'label' => $this->getArg( 'label' ),
                'section' => $this->section->getID(),
                'type' => $this->type
            )
        );
    }

}