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
        'type' => 'image',
        'returnObj' => 'Image'
    );


    public function prepareTemplateData($data)
    {
        $image = new AttachmentHandler($this->getValue('id'));

        if (isset($data['value']['crop']) && !is_array($data['value']['crop'])) {
            $int = absint($data['value']['crop']);
            $image->setCropPosition(self::getCropValue($int));
        }

        $data['image'] = $image;
        return $data;
    }

    /**
     * @param $int
     * @return mixed
     */
    public static function getCropValue($int)
    {
        $values = array(
            1 => array('left', 'top'),
            2 => array('center', 'top'),
            3 => array('right', 'top'),
            4 => array('left', 'center'),
            5 => array('center', 'center'),
            6 => array('right', 'center'),
            7 => array('left', 'bottom'),
            8 => array('center', 'bottom'),
            9 => array('right', 'bottom')
        );

        $int = absint($int);
        if (isset($values[$int])) {
            return $values[$int];
        }
        return $values[5];
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        if (empty($val)) {
            return array(
                'id' => null,
                'caption' => '',
                'title' => '',
                'crop' => array('center', 'center')
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
    public function save($new, $old)
    {
        if (is_null($new)) {
            return null;
        }

        $caption = (isset($new['caption']) && !empty($new['caption'])) ? $new['caption'] : '';
        $title = (isset($new['title']) && !empty($new['title'])) ? $new['title'] : '';

        if (isset($new['id']) && !empty($new['id'])) {
            wp_update_post(
                array(
                    'ID' => absint($new['id']),
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
    public function addCustomizerControl(\WP_Customize_Manager $customizeManager, CustomizerIntegration $integration)
    {
        $customizeManager->add_control(
            new WP_Customize_Media_Control(
                $customizeManager, $integration->getSettingName($this),
                array(
                    'label' => $this->getArg('label'),
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
    public function addCustomizerSetting(\WP_Customize_Manager $customizeManager, CustomizerIntegration $integration)
    {
        $customizeManager->add_setting(
            new ImageSetting($customizeManager, $integration->getSettingName($this), array(
                'default' => $this->getArg('std'),
                'type' => 'option',
                'field' => $this
            ))
        );
    }


}