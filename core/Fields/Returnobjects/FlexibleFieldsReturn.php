<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Fields\Definitions\FlexibleFields;

/**
 * Class FlexibleFieldsReturn
 * @package Kontentblocks\Fields\Utilities
 * @since 0.1.0
 */
class FlexibleFieldsReturn
{

    /**
     * @var \Kontentblocks\Fields\Definitions\FlexibleFields
     */
    protected $field;

    /**
     * @var string id of parent module
     */
    protected $moduleId;

    /**
     * @var string
     */
    protected $key;

    /**
     * @var array data of this field from moduleData
     */
    protected $fieldData;

    /**
     * Flexible Field config array
     * @var array
     */
    protected $config;

    /**
     * Class Constructor
     * @since 0.1.0
     *
     * @param FlexibleFields $field
     */
    public function __construct( $value, FlexibleFields $field )
    {
        $this->field = $field;
        $this->key = $field->getKey();
        $this->fieldData = $field->getValue();
        $this->moduleId = $field->getFieldId();
        $this->config = $field->getArg( 'config' );
    }

    /**
     * Get prepared saved items
     * @since 0.1.0
     * @return array|bool
     */
    public function getItems()
    {
        // check properties integrity
        if (!$this->validate()) {
            return false;
        };

        $items = $this->setupItems();

        if (!is_array( $items )) {
            return array();
        }

        return $items;
    }

    /**
     * Iterate through fields and set up
     * @since 0.1.0
     * @return array
     */
    public function setupItems()
    {
        $registry = Kontentblocks()->getService('registry.fields');
        $fields = $this->extractFieldsFromConfig();
        $items = array();
        foreach ($this->fieldData as $index => $data) {
            $item = array();
            foreach ($fields as $key => $conf) {

                if (empty( $data[$key] )) {
                    $data[$key] = $conf['std'] || '';
                };

                /** @var \Kontentblocks\Fields\Field $field */
                $field = $registry->getField($conf['type'],$this->moduleId, $index, $key );
                $field->setBaseId($this->moduleId, $this->key);
                $field->setValue($data[$key]);
                $field->setArgs(['index' => $index, 'arrayKey' => $this->key]);
                $item[$key] = $this->getReturnObj( $conf['type'], $data[$key], $field );
            }
            $items[] = $item;
        }

        return $items;
    }

    /**
     * Validate if all necessary props are set
     * @since 0.1.0
     * @return bool
     */
    private function validate()
    {

        if (empty( $this->fieldData )) {
            return false;
        }

        if (!isset( $this->moduleId )) {
            return false;
        }

        if (!isset( $this->key )) {
            return false;
        }

        if (!isset( $this->config )) {
            return false;
        }

        return true;
    }

    /**
     * Collect all fields to one array
     * @return array
     */
    private function extractFieldsFromConfig()
    {
        $collect = array();
        foreach ($this->config as $key => $tab) {
            if (!empty( $tab['fields'] )) {
                $collect += $tab['fields'];
            }
        }

        return $collect;
    }

    /**
     * Sets up the correct ReturnObject for each field
     * before frontend rendering
     * @TODO Should not be the responsibility of the AbstractEditableFieldReturn Class to create proper Fields
     * @TODO see AbstractEditableFieldSetup
     *
     * @param $type string
     * @param $keydata array
     * @param $field
     * @return EditableElement|EditableImage
     *
     * @since 0.1.0
     */
    private function getReturnObj( $type, $keydata, $field )
    {
        switch ($type) {

            case ( 'text' ):
            case ( 'editor' ):
            case ( 'textarea' ):
                return new EditableElement(
                    $keydata , $field
                );

                break;

            case ( 'link' ):
                return new EditableLink(
                    $keydata, $field
                );

            case ( 'image' ):
                return new EditableImage(
                    $keydata, $field
                );
                break;
        }
    }


}