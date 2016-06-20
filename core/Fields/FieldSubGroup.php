<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Common\Exportable;
use Kontentblocks\Fields\Definitions\ReturnObjects\FieldCollection;

/**
 * Class FieldSubGroup
 * To group a set of x fields under one key data-wise
 * works like an adapter to a normal field
 * @package Kontentblocks\Fields
 */
class FieldSubGroup implements Exportable
{

    /**
     * Field Args
     * @var array
     */
    public $args;
    /**
     * Storage Key
     * @var string
     * @since 0.1.0
     */
    protected $key;
    /**
     * Attached fields
     * @var array
     * @since 0.1.0
     */
    protected $fields;
    /**
     * @var string base id
     * @since 0.1.0
     */
    protected $baseId;
    /**
     * @var Returnobjects\FieldCollection
     * @since 0.1.0
     */
    protected $returnObj;

    /**
     * @var StandardFieldSection
     */
    protected $section;

    /**
     * Class constructor
     * @since 0.1.0
     *
     * @param string $key
     * @param array $args
     * @param StandardFieldSection $section
     */
    public function __construct($key, $args = array(), StandardFieldSection $section)
    {
        $this->key = $key;
        $this->args = $args;
        $this->section = $section;
    }

    /**
     * Add field
     *
     * @param string $key
     * @param Field $field
     * @return $this
     *
     * @since 0.1.0
     */
    public function addField($key, Field $field)
    {
        $this->fields[$key] = $field;
        $this->$key = $field;
        return $this;
    }

    /**
     * Wrapper to each fields setup method
     *
     * @param array $instanceData
     * @since 0.1.0
     */
    public function setup($instanceData)
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {

            if (!is_object($field)){
                continue;
            }

            $fielddata = (!empty($instanceData[$field->getKey()])) ? $instanceData[$field->getKey()] : $field->getArg(
                'std',
                ''
            );
            $field->setData($fielddata);
        }
    }


    /**
     * Pass through _save() method to each field
     *
     * @param $data
     * @param $oldData
     *
     * @since 0.1.0
     * @return array
     */
    public function _save($data, $oldData)
    {
        $collect = array();
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $old = (isset($oldData[$field->getKey()])) ? $oldData[$field->getKey()] : null;

            if (isset($data[$field->getKey()])) {
                $collect[$field->getKey()] = $field->_save($data[$field->getKey()], $old);
            } else {
                if ($field->getSetting('forceSave')) {
                    // calls save on field if key is not present
                    $collect[$field->getKey()] = $field->_save(null, $old);
                }
            }

        }
        return $collect;
    }

    /**
     * Getter for $key
     * @since 0.1.0
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * Special Return Object
     * will setup each fields return object seperately
     * @return object Returnobjects\FieldCollection
     * @since 0.1.0
     */
    public function getFrontendValue()
    {
        $this->returnObj = new FieldCollection($this->fields);
        return $this->returnObj;
    }

    /**
     * Passes the setBaseId() call through to the actual field method
     * Modifies the baseId to setup the array nature
     * Called by a section handler
     * Part of the backend form rendering process
     *
     * @param string $baseId
     *
     * @since 0.1.0
     */
    public function setBaseId($baseId)
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $field->setBaseId($baseId, $this->key);
        }
    }

    /**
     * Pass through of section handler setValue() on field call
     * Ensures each child field receives its corresponding data
     * Part of the backend form rendering process
     *
     * @param array $data
     * @since 0.1.0
     */
    public function setData($data)
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $fielddata = (!empty($data[$field->getKey()])) ? $data[$field->getKey()] : $field->getArg('std', '');
            $field->setData($fielddata);
        }
    }

    /**
     * @return array
     */
    public function getDefaultValue()
    {
        $collect = array();
        foreach ($this->fields as $field) {
            if (!is_object($field)){
                continue;
            }
            $collect[$field->getKey()] = $field->getDefaultValue();
        }
        return $collect;
    }


    /**
     * @param $arg
     * @param string $default
     * @return mixed|string
     */
    public function getArg($arg, $default = '')
    {

        if (isset($this->args[$arg])) {
            return $this->args[$arg];
        }

        return $default;
    }


    /**
     * @return array
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * Pass getValue calls to single fields and collect results
     * @return array
     * @since 0.1.0
     */
    public function getValue()
    {
        $collected = array();

        if (!empty($this->fields)) {
            /** @var Field $field */
            foreach ($this->fields as $field) {
                $collected[$field->getKey()] = $field->getValue();
            }
        }
        return $collected;
    }

    /**
     * Pass through build() method call to child fields
     * @since 0.1.0
     * @return void
     */
    public function build()
    {
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $field->build();
        }

    }

    /**
     * @param $collection
     */
    public function export(&$collection)
    {
        foreach ($this->fields as $field) {
            $field->export($collection);
        }
    }
}