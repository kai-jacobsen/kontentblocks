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

        add_action('wp_enqueue_scripts', function(){
            wp_register_style('leaflet-css', 'https://unpkg.com/leaflet@1.3.4/dist/leaflet.css');
            wp_register_style('leaflet-geocoder',
                'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css');
            wp_register_script('leaflet-js', 'https://unpkg.com/leaflet@1.3.4/dist/leaflet.js');
            wp_register_script('leaflet-geocoder',
                'https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js');
        });

        add_action('admin_enqueue_scripts', function () {
            wp_enqueue_style('leaflet-css');
            wp_enqueue_style('leaflet-geocoder');
            wp_enqueue_script('leaflet-js');
            wp_enqueue_script('leaflet-geocoder');
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