<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Customizer\Controls\LinkControl;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;
use Kontentblocks\Language\I18n;
use Kontentblocks\Panels\CustomizerIntegration;

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

    /**
     * @param \WP_Customize_Manager $customizeManager
     * @return null
     */
    public function addCustomizerControl( \WP_Customize_Manager $customizeManager, CustomizerIntegration $integration )
    {
        $customizeManager->add_control(
            new LinkControl($customizeManager, $integration->getSettingName( $this ),
                array(
                    'label' => $this->getArg( 'label' ),
                    'description' => $this->getArg( 'description' ),
                    'section' => $this->section->getID(),
                    'type' => $this->type
                )
            )
        );
    }

}