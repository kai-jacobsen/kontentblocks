<?php

namespace Kontentblocks\Fields\Customizer\Settings;


use Kontentblocks\Fields\Field;

/**
 * Class ImageSetting
 * @package Kontentblocks\Fields\Customizer\Settings
 */
class ImageSetting extends \WP_Customize_Setting
{
    /**
     * @var Field
     */
    public $field;

    public function __construct( $manager, $id, $args )
    {
        parent::__construct( $manager, $id, $args );
        $this->field = $args['field'];
    }


    public function preview(){
        $value = $this->post_value();

        if ($value) {
            $post_id = attachment_url_to_postid( $value );
            if ($post_id) {
                $attachment = wp_prepare_attachment_for_js($post_id);
                $value = array();
                $value['id'] = $post_id;
                $value['caption'] = $attachment['caption'];
                $value['title'] = $attachment['title'];
            }
        }

        $this->manager->set_post_value($this->id, $value);

        parent::preview();
    }

    /**
     * Overwrites the `update()` method so we can save some extra data.
     * @author http://justintadlock.com/archives/2015/05/06/customizer-how-to-save-image-media-data
     * @param mixed $value
     * @return mixed
     */
    protected function update( $value )
    {
        if ($value) {
            $post_id = attachment_url_to_postid( $value );
            if ($post_id) {
                $attachment = wp_prepare_attachment_for_js($post_id);
                $value = array();
                $value['id'] = $post_id;
                $value['caption'] = $attachment['caption'];
                $value['title'] = $attachment['title'];
            }
        }
        /* Let's send this back up and let the parent class do its thing. */
        return parent::update( $value );
    }

    /**
     * Fetch the value of the setting.
     *
     * @since 3.4.0
     *
     * @return mixed The value.
     */
    public function value(){
        return absint($this->field->getValue('id'));
    }

}