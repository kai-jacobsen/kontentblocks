<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Customizer\CustomizerIntegration;
use WP_Customize_Manager;

/**
 * Opening Times
 * Additional args are:
 * TODO: document configuration
 *
 */
Class OpeningTimes extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'otimes',
        'forceSave' => true
    );


    public function prepareTemplateData( $data )
    {
        $value = $data['value'];
        $hasSplit = false;
        if (is_array($value)){
            $splitValues = array_map(function($item){
                return $item[1];
            }, $value);
            array_walk_recursive($splitValues, function($v) use (&$hasSplit){
                 if (!empty($v)){
                     $hasSplit = true;
                 }
            });
        }

        $data['value']['hasSplit'] = $hasSplit;
        return $data;
    }

    /**
     * To make sure that the saving routine doesn't preserve unset
     * items from the old data (which is its purpose)
     * we need to set deleted items explicitly to NULL
     * This will remove the data from the $old data while saving
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed $new
     */
    public function save( $new, $old )
    {

        // clean up invalid values

        if (is_array( $new )) {
            array_walk_recursive(
                $new,
                function ( &$val ) {
                    if ($val === '__:__') {
                        $val = '';

                    }
                }
            );
        }

        return $new;
    }

    /**
     * @param $value
     * @internal param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $value )
    {
        return $this->cleanData($value);
    }

    /**
     * @param $value
     * @return array
     */
    public function cleanData($value)
    {
        $whitelist = array('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
        $valid = array();
        foreach ($whitelist as $day){
            if (isset($value[$day])){
                $valid[$day] = $this->value[$day];
            }
        }
        return $valid;
    }

    public function addCustomizerControl( WP_Customize_Manager $customizeManager, CustomizerIntegration $integration )
    {
        // silence
    }

}