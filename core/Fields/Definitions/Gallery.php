<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Utils\JSONBridge;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Gallery extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'gallery',
        'returnObj' => 'Gallery'
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<div id='{$this->getInputFieldId()}' data-fieldkey='{$this->getKey()}' data-arraykey='{$this->getArg(
            'arrayKey'
        )}' data-module='{$this->getFieldId()}' class='kb-gallery--stage'></div>";
        $this->description();

    }

    /**
     * Runs when data is set to the field
     * @param $data
     * @return mixed
     */
    public function inputFilter( $data )
    {
        $forJSON = null;
        if (!empty( $data['images'] ) && is_array( $data['images'] )) {
            foreach ($data['images'] as &$image) {
                if (isset( $image['id'] )) {
                    $image['file'] = wp_prepare_attachment_for_js( $image['id'] );
                    $image['file']['title'] = $image['details']['title'];
                    $image['file']['alt'] = $image['details']['alt'];
                    $image['file']['description'] = ( !empty( $image['details']['description'] ) ) ? $image['details']['description'] : '';
                }
            }

            $forJSON = array_values( $data['images'] );
        }
        $Bridge = JSONBridge::getInstance();
        $Bridge->registerFieldData(
            $this->getFieldId(),
            $this->type,
            $forJSON,
            $this->getKey(),
            $this->getArg( 'arrayKey' )
        );
        return $data;

    }

    public function save( $data, $old )
    {

        if (is_null( $data )) {
            return $old;
        }

        if (!empty( $data['images'] )) {
            foreach ($data['images'] as $key => $image) {
                if (!empty( $image['remove'] ) && $image['remove'] == 'true') {
                    unset( $data['images'][$key] );
                    continue;
                }

                if (!isset( $image['uid'] )) {
                    $uid = uniqid( 'kbg' );
                    $image['uid'] = $uid;
                    unset( $data['images'][$key] );
                    $data['images'][$uid] = $image;
                }


            }
        }
        if (is_array( $old['images'] )) {
            foreach ($old['images'] as $k => $v) {
                if (!array_key_exists( $k, $data['images'] )) {
                    $data['images'][$k] = null;
                }
            }
        }
        return $data;

    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }
}