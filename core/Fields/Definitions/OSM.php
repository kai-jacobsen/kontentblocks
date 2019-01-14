<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

Class OSM extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'osm'
    );

    public static function init()
    {

        add_action('admin_enqueue_scripts', function () {
            wp_register_style('leaflet-css', KB_PLUGIN_URL . 'css/assets/' . 'leaflet.css');
            wp_register_script('leaflet-js', KB_PLUGIN_URL . 'js/vendor/leaflet.js');
            wp_register_script('leaflet-geocoder', 'KB_PLUGIN_URL' . 'js/vendor/leaflet.js');

            if (is_admin()) {
                wp_enqueue_style('leaflet-css');
                wp_enqueue_script('leaflet-js');
                wp_enqueue_script('leaflet-geocoder');
            }
        });


    }


    /**
     * When this data is retrieved
     * @param $val
     *
     * @return array
     */
    public function prepareFrontendValue($val)
    {
        return $val;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        if (!isset($val['lat']) && !isset($val['lng'])) {
            $val = null;
        }

        if (empty($val)) {
            return array(
                'lat' => '',
                'lng' => '',
            );
        }

        return $val;
    }


}