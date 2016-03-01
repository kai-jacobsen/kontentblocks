<?php

namespace Kontentblocks\Customizer;


use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Fields\Field;
use Kontentblocks\Panels\OptionPanel;

/**
 * Class CustomizerIntegration
 * @package Kontentblocks\Customizer
 */
class CustomizerIntegration
{
    /**
     * @var \WP_Customize_Manager
     */
    public $customizeManager;
    /**
     * @var array
     */
    public $fields;
    /**
     * @var StandardFieldController
     */
    protected $fieldController;
    /**
     * @var OptionPanel
     */
    protected $panel;

    /**
     * @param StandardFieldController $fieldController
     * @param \WP_Customize_Manager $wpCustomize
     * @param OptionPanel $panel
     */
    public function __construct(
        StandardFieldController $fieldController,
        \WP_Customize_Manager $wpCustomize,
        OptionPanel $panel
    )
    {
        add_action( 'customize_update_kb_option_panel', array($this, 'save'), 10, 2 );

        $this->fieldController = $fieldController;
        $this->fields = $fieldController->collectAllFields();
        $this->customizeManager = $wpCustomize;
        $this->panel = $panel;
        $this->addPanel();
        $this->addSections();
        $this->addSettings();
        $this->addControls();
    }

    private function addPanel()
    {
        $name = $this->panel->getName();
        $this->customizeManager->add_panel(
            $name,
            array(
                'title' => $name
            )
        );

    }

    private function addSections()
    {
        foreach ($this->fieldController->sections as $name => $section) {
            $this->customizeManager->add_section(
                $name,
                array(
                    'title' => $name,
                    'panel' => $this->panel->getName()
                )
            );
        }

    }

    private function addSettings()
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {

            if (method_exists($field, 'addCustomizerSetting')){
                $field->addCustomizerSetting($this->customizeManager, $this);
            } else {
                $this->customizeManager->add_setting(
                    $this->getSettingName( $field ),
                    array(
                        'default' => $field->getArg( 'std' ),
                        'type' => 'option',
                    )
                );
            }
        }


    }

    /**
     * @param $field
     * @return string
     */
    public function getSettingName( Field $field )
    {
        $base = $this->panel->getBaseId();
        return $base . '[' . $field->getKey() . ']';
    }

    private function addControls()
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $field->addCustomizerControl( $this->customizeManager, $this );
        }
    }

}