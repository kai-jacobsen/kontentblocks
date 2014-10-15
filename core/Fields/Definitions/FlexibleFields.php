<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONBridge;

/**
 * Flexible Fields
 * Additional args are:
 * TODO: document configuration
 *
 */
Class FlexibleFields extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'flexfields',
        'forceSave' => true
    );

    /**
     * Form
     */
    public function form()
    {
        $this->label();
        echo "<div id='{$this->getFieldId()}' data-fieldkey='{$this->key}' data-arraykey='{$this->getArg(
            'arrayKey'
        )}' data-module='{$this->parentModuleId}' class='flexible-fields--stage'></div>";
        $this->description();

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
        $Registry = Kontentblocks::getService( 'registry.fields' );


        if (is_null( $new )) {
            return $old;
        }

        if (is_array( $new )) {
            foreach ($new as $item => $def) {
                if (isset( $def['delete'] )) {
                    $new[$item] = null;
                }

            }
        }

        if (is_array( $new )) {
            foreach ($new as &$field) {
                if (is_null( $field )) {
                    continue;
                }

                foreach ($field['_mapping'] as $key => $type) {
                    /** @var \Kontentblocks\Fields\Field $fieldInstance */
                    $fieldInstance = Kontentblocks::getService( 'registry.fields' )->getField( $type );
                    $field[$key] = $fieldInstance->save( $field[$key], $old );
                }

                if (!isset( $field['_uid'] )) {
                    $field['_uid'] = uniqid( 'ff' );
                }

            }
        }



        return $new;
    }

    /**
     * @param $value
     * @internal param $val
     *
     * @return mixed
     */
    protected function prepareInputValue( $value )
    {

        $forJSON = array();
        // make sure it's an simple indexed array to preserve order
        if (is_array( $value )) {
            $forJSON = array_values( $value );
        }
        // run data through fields output method to retrieve optional filtered data
        if (!empty( $forJSON )) {
            foreach ($value as &$item) {
                if (isset( $item['_mapping'] )) {
                    foreach ($item['_mapping'] as $key => $type) {
                        /** @var \Kontentblocks\Fields\Field $fieldInstance */
                        $fieldInstance = Kontentblocks::getService( 'registry.fields' )->getField( $type );
                        $item[$key] = $fieldInstance->prepareInputValue( $item[$key] );
                    }
                }
            }
        }

        $Bridge = JSONBridge::getInstance();
        $Bridge->registerFieldData(
            $this->parentModuleId,
            $this->type,
            $forJSON,
            $this->getKey(),
            $this->getArg( 'arrayKey' )
        );

        return $value;
    }

}