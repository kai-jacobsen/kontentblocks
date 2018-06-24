<?php

namespace Kontentblocks\Fields;


/**
 * Class FieldExport
 * @package Kontentblocks\Fields
 */
class FieldExport implements \ArrayAccess
{

    /**
     * @var array
     */
    private $fields = array();

    private $bySection = array();

    /**
     * Offset to retrieve
     * @return mixed Can return all value types.
     */
    public function offsetGet($offset)
    {
        return $this->fields[$offset];
    }

    /**
     * Offset to unset
     * @param mixed $offset <p>
     * @return void
     */
    public function offsetUnset($offset)
    {
        if ($this->offsetExists($offset)) {
            unset($this->fields[$offset]);
        }
    }

    /**
     * @param mixed $offset <p>
     * @return boolean true on success or false on failure.
     * @since 5.0.0
     */
    public function offsetExists($offset)
    {
        return isset($this->fields[$offset]);
    }

    /**
     * @param $fieldId
     * @param $args
     * @return $this
     */
    public function addField($fieldId, $args)
    {
        $this->offsetSet($fieldId, $args);
        $this->addFieldToSection($fieldId, $args);
        return $this;
    }

    /**
     * Offset to set
     * @param mixed $value <p>
     * @return void
     */
    public function offsetSet($offset, $value)
    {
        $this->fields[$offset] = $value;
    }

    /**
     * @param $fieldId
     * @param $args
     */
    public function addFieldToSection($fieldId, $args)
    {
        if (isset($args['section'])) {
            $section = $args['section'];
            if (!isset($this->bySection[$section])) {
                $this->bySection[$section] = [];
            }
            $this->bySection[$section][$fieldId] = $args;
        }
    }

    /**
     * @return array
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     * @return array
     */
    public function getVisibleFields()
    {
        return array_filter($this->fields, function ($field) {
            if (isset($field['args']) && is_array($field['args']) && isset($field['args']['display'])) {
                return $field['args']['display'];
            }
            return false;
        });
    }

}