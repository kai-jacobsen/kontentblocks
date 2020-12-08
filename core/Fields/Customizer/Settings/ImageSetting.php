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

    public function __construct($manager, $id, $args)
    {
        parent::__construct($manager, $id, $args);
        $this->field = $args['field'];
    }


    public function preview()
    {
        $value = $this->post_value();
        if ($value) {
            $post_id = attachment_url_to_postid($value);
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
     * Fetch the value of the setting.
     *
     * @return mixed The value.
     * @since 3.4.0
     *
     */
    public function value()
    {

        $id_base = $this->id_data['base'];
        $is_core_type = ('option' === $this->type || 'theme_mod' === $this->type);

        if (!$is_core_type && !$this->is_multidimensional_aggregated) {

            // Use post value if previewed and a post value is present.
            if ($this->is_previewed) {
                $value = $this->post_value(null);
                if (null !== $value) {
                    return $value;
                }
            }

            $value = $this->get_root_value($this->default);

            /**
             * Filters a Customize setting value not handled as a theme_mod or option.
             *
             * The dynamic portion of the hook name, `$id_base`, refers to
             * the base slug of the setting name, initialized from `$this->id_data['base']`.
             *
             * For settings handled as theme_mods or options, see those corresponding
             * functions for available hooks.
             *
             * @param mixed $default The setting default value. Default empty.
             * @param WP_Customize_Setting $this The setting instance.
             * @since 3.4.0
             * @since 4.6.0 Added the `$this` setting instance as the second parameter.
             *
             */
            $value = apply_filters("customize_value_{$id_base}", $value, $this);
        } elseif ($this->is_multidimensional_aggregated) {
            $root_value = self::$aggregated_multidimensionals[$this->type][$id_base]['root_value'];
            $value = $this->multidimensional_get($root_value, $this->id_data['keys'], $this->default);
            // Ensure that the post value is used if the setting is previewed, since preview filters aren't applying on cached $root_value.
            if ($this->is_previewed) {
                $value = $this->post_value($value);
            }
        } else {
            $value = $this->get_root_value($this->default);
        }

        if (is_array($value) && isset($value['id'])) {
            if (!empty($value['id'])) {
                return $value['id'];
            }
        }
        return $value;
    }

    /**
     * Fetch the value of the setting.
     *
     * @return mixed The value.
     * @since 3.4.0
     *
     */

    /**
     * Overwrites the `update()` method so we can save some extra data.
     * @author http://justintadlock.com/archives/2015/05/06/customizer-how-to-save-image-media-data
     * @param mixed $value
     * @return mixed
     */
    protected function update($value)
    {
        if ($value) {
            $post_id = attachment_url_to_postid($value);
            if ($post_id) {
                $attachment = wp_prepare_attachment_for_js($post_id);
                $value = array();
                $value['id'] = $post_id;
                $value['caption'] = $attachment['caption'];
                $value['title'] = $attachment['title'];
            }
        }
        /* Let's send this back up and let the parent class do its thing. */
        return parent::update($value);
    }

}