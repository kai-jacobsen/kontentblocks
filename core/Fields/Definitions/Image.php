<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Customizer\CustomizerIntegration;
use Kontentblocks\Fields\Customizer\Settings\ImageSetting;
use Kontentblocks\Fields\Field;
use Kontentblocks\Utils\AttachmentHandler;
use WP_Customize_Media_Control;

/**
 * Single image insert/upload.
 * @return array attachment id, title, caption
 *
 */
Class Image extends Field
{

    public static $settings = array(
        'type' => 'image'
    );


    public function prepareTemplateData( $data )
    {
        $data['image'] = new AttachmentHandler( $this->getValue( 'id' ) );
        return $data;
    }



    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        if (empty( $val )) {
            return array(
                'id' => null,
                'caption' => '',
                'title' => ''
            );
        }

        return $val;

    }

    /**
     * Fields saving method
     *
     * @param mixed $new
     * @param mixed $old
     * @return mixed
     *
     */
    public function save( $new, $old )
    {
        if (is_null( $new )) {
            return null;
        }

        $caption = ( isset( $new['caption'] ) && !empty( $new['caption'] ) ) ? $new['caption'] : '';
        $title = ( isset( $new['title'] ) && !empty( $new['title'] ) ) ? $new['title'] : '';

        if (isset( $new['id'] ) && !empty( $new['id'] )) {
            wp_update_post(
                array(
                    'ID' => absint( $new['id'] ),
                    'post_excerpt' => $caption,
                    'post_title' => $title
                )
            );
        }
        return $new;
    }

    /**
     * @param \WP_Customize_Manager $customizeManager
     * @return null
     */
    public function addCustomizerControl( \WP_Customize_Manager $customizeManager, CustomizerIntegration $integration )
    {
        $customizeManager->add_control(
            new WP_Customize_Media_Control(
                $customizeManager, $integration->getSettingName( $this ),
                array(
                    'label' => $this->getArg( 'label' ),
                    'section' => $this->section->getSectionId(),
                    'type' => $this->type
                )
            )
        );
    }

    /**
     * @param \WP_Customize_Manager $customizeManager
     * @param CustomizerIntegration $integration
     */
    public function addCustomizerSetting(\WP_Customize_Manager $customizeManager, CustomizerIntegration $integration){
         $customizeManager->add_setting(
             new ImageSetting($customizeManager, $integration->getSettingName($this), array(
                 'default' => $this->getArg( 'std' ),
                 'type' => 'option',
                 'field' => $this
             ))
         );
    }

}