<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Fields\Definitions\FlexibleFields;

/**
 * Class FlexibleFieldsReturn
 * @package Kontentblocks\Fields\Utilities
 * @since 0.1.0
 */
class FlexibleFieldsReturn implements InterfaceFieldReturn
{

    public $value;

    public $items = array();
    /**
     * @var \Kontentblocks\Fields\Definitions\FlexibleFields
     */
    public $field;
    public $salt;
    /**
     * @var string id of parent module
     */
    protected $entityId;
    /**
     * @var string
     */
    protected $key;
    /**
     * @var array data of this field from entityData
     */
    protected $fieldData;
    /**
     * Flexible Field config array
     * @var array
     */
    protected $types;

    /**
     * Class Constructor
     * @since 0.1.0
     *
     * @param $value
     * @param FlexibleFields $field
     * @param $salt
     */
    public function __construct($value, FlexibleFields $field, $salt)
    {

        $this->field = $field;
        $this->key = $field->getKey();
        $this->fieldData = $value;
        $this->entityId = $field->getFieldId();
        $this->types = $field->getArg('fields');
        $this->items = $this->setupItems();
        $this->salt = $salt;
        $this->value = $value;
    }

    /**
     * Iterate through fields and set up
     * @since 0.1.0
     * @return array
     */
    public function setupItems()
    {
        if (!empty($this->items)) {
            return $this->items;
        }

        if (!is_array($this->fieldData)) {
            return array();
        }
        $registry = Kontentblocks()->getService('registry.fields');
        $fields = $this->extractFieldsFromConfig();
        $items = array();
        foreach ($this->fieldData as $index => $data) {

            if (empty($data)) {
                continue;
            }

            $item = array();
            foreach ($fields as $key => $conf) {
                /** @var \Kontentblocks\Fields\Field $field */

                if (!isset($data[$conf['key']])){
                    continue;
                }
                $field = $registry->getField($conf['type'], $this->entityId, $index, $key);

                if (!isset($data[$key])) {
                    $data[$key] = $field->getArg('std', '');
                }

                $field->setBaseId($this->entityId, $this->key);
                $field->setData($data[$key]);
                $field->setArgs(array('index' => $index, 'arrayKey' => $this->key));
                $field->setArgs($conf);
                $item[$key] = $field->getFrontendValue($this->salt);
                $item['index'] = $index;
                $item['type'] = $key;
                $item['_meta'] = $data['_meta'];
            }
            $items[$index] = $item;
        }
        $original = $this->field->getValue();
        if (is_array($original)) {
            $items = array_replace($original, array_intersect_key($items, $original));
        }
        return $items;
    }

    /**
     * Collect all fields to one array
     * @return array
     */
    private function extractFieldsFromConfig()
    {
        if (!is_array($this->types)) {
            return array();
        }
        $collect = array();
        foreach ($this->types as $key => $type) {

            foreach ($type['sections'] as $section) {
                if (!empty($section['fields'])) {
                    foreach ($section['fields'] as $field) {
                        $field['fftype'] = $key;
                        $collect[$field['key']] = $field;
                    }
                }
            }
        }
        return $collect;
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
        if (!is_array($items)) {
            return array();
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

        if (empty($this->fieldData)) {
            return false;
        }

        if (!isset($this->entityId)) {
            return false;
        }

        if (!isset($this->key)) {
            return false;
        }

        if (!isset($this->types)) {
            return false;
        }

        return true;
    }

    public function shuffle()
    {

        shuffle($this->items);
        return $this;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return $this->value;
    }
}