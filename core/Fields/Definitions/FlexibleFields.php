<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;

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
        'forceSave' => true,
        'returnObj' => 'FlexibleFieldsReturn'
    );


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
        $flatFields = $this->flattenFields();

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
            foreach ($new as $ukey => &$section) {
                if (is_null( $section )) {
                    continue;
                }
                /** @var Field $field */
                foreach ($section as $fkey => $field) {
                    if (!array_key_exists($fkey,$flatFields)){
                        continue;
                    }
                    $type = $flatFields[$fkey]['type'];
                    /** @var \Kontentblocks\Fields\Field $fieldInstance */
                    $fieldInstance = Kontentblocks::getService( 'registry.fields' )->getField(
                        $type,
                        $ukey,
                        null,
                        $section[$fkey]
                    );
                    $section[$fkey] = $fieldInstance->save( $section[$fkey], $old );

                    if (!isset( $section['_uid'] )) {
                        $section['_uid'] = $ukey;
                    }
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
    public function prepareFormValue( $value )
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
                        $fieldInstance = Kontentblocks::getService( 'registry.fields' )->getField(
                            $type,
                            $this->getFieldId(),
                            null,
                            $item[$key]
                        );
                        $item[$key] = $fieldInstance->prepareFormValue( $item[$key] );
                    }
                }
            }
        }

        return $value;
    }

    private function flattenFields()
    {
        $flat = [];
        $config = $this->getArg('config');
        foreach ($config as $section) {
            foreach ($section['fields'] as $key => $args ) {
                $flat[$key] = $args;
            }
        }
        return $flat;
    }

}