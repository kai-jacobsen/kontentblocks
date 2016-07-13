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
Class CropImage extends Field
{

    public static $settings = array(
        'type' => 'cropimage',
        'returnObj' => 'ImageReturn'
    );


    public function prepareTemplateData($data)
    {
        $image = new AttachmentHandler($this->getValue('id'));
        $data['image'] = $image;
        return $data;
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


}