<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Customizer\Controls\LinkControl;
use Kontentblocks\Fields\Definitions\ReturnObjects\LinkReturn;
use Kontentblocks\Fields\Field;
use Kontentblocks\Customizer\CustomizerIntegration;

/**
 * WordPress Link dialog based input field
 * Additional args are:
 *
 */
Class Link extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'link',
        'returnObj' => 'LinkReturn'

    );


    /**
     * @param array $val
     * @return array
     */
    public function prepareFormValue($val)
    {

        $data = wp_parse_args($val, $this->getDefaultValue());
        $data['link'] = esc_url($data['link']);
        $data['linktext'] = esc_html($data['linktext']);
        $data['linktitle'] = esc_html($data['linktitle']);

        return $data;
    }

    /**
     * @return array
     */
    public function getDefaultValue()
    {
        return array(
            'link' => '',
            'linktext' => '',
            'linktitle' => ''
        );
    }

    /**
     * @param \WP_Customize_Manager $customizeManager
     * @return null
     */
    public function addCustomizerControl(\WP_Customize_Manager $customizeManager, CustomizerIntegration $integration)
    {
        $customizeManager->add_control(
            new LinkControl($customizeManager, $integration->getSettingName($this),
                array(
                    'label' => $this->getArg('label'),
                    'description' => $this->getArg('description'),
                    'section' => $this->section->getSectionId(),
                    'type' => 'kbLink',
                    'input_attrs' => array(
                        'id' => $this->createUID()
                    )
                )
            )
        );
    }

    /**
     * @param $value
     * @param $salt
     * @return Link
     */
    protected function getStandardReturnObject($value, $salt)
    {
        return new Link($value, $this, $salt);
    }

}