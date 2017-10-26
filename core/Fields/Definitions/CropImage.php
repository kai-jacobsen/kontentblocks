<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Customizer\CustomizerIntegration;
use Kontentblocks\Fields\Customizer\Settings\ImageSetting;
use Kontentblocks\Fields\Definitions\ReturnObjects\ImageReturn;
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


    /**
     * Before the data is injected into the field/form twig template
     * Used to further manipulate or extend the data for the form
     * @param array $data
     * @return array
     */
    public function prepareTemplateData($data)
    {
        $image = new ImageReturn($this->value, $this, null);
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

        return $new;
    }


}