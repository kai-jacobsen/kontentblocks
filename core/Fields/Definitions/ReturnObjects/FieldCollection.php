<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Fields\Field;

/**
 * @todo: finish
 */
class FieldCollection implements \ArrayAccess, InterfaceFieldReturn
{

    public $value;
    protected $fields;

    /**
     *
     * @param $fields
     */
    public function __construct($fields)
    {
        $this->fields = $fields;
        $this->setupFields();
    }

    public function setupFields()
    {
        $collect = array();

        /** @var Field $field */
        foreach ($this->fields as $field) {
            $value = $field->getFrontendValue();
            $fieldkey = $field->getKey();
            $this->$fieldkey = $value;
            $collect[$field->getKey()] = $value;
        }
        $this->value = $collect;
    }

    /**
     * @param $key
     * @return mixed
     */
    public function get($key)
    {
        return $this->$key;
    }

    /**
     * @return mixed
     */
    public function getItems()
    {
        return $this->value;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Whether a offset exists
     * @link http://php.net/manual/en/arrayaccess.offsetexists.php
     * @param mixed $offset <p>
     * An offset to check for.
     * </p>
     * @return boolean true on success or false on failure.
     * </p>
     * <p>
     * The return value will be casted to boolean if non-boolean was returned.
     */
    public function offsetExists($offset)
    {
        return property_exists($this, $offset);
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to retrieve
     * @link http://php.net/manual/en/arrayaccess.offsetget.php
     * @param mixed $offset <p>
     * The offset to retrieve.
     * </p>
     * @return mixed Can return all value types.
     */
    public function offsetGet($offset)
    {
        return $this->$offset;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to set
     * @link http://php.net/manual/en/arrayaccess.offsetset.php
     * @param mixed $offset <p>
     * The offset to assign the value to.
     * </p>
     * @param mixed $value <p>
     * The value to set.
     * </p>
     * @return void
     */
    public function offsetSet($offset, $value)
    {
        $this->$offset = $value;
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to unset
     * @link http://php.net/manual/en/arrayaccess.offsetunset.php
     * @param mixed $offset <p>
     * The offset to unset.
     * </p>
     * @return void
     */
    public function offsetUnset($offset)
    {
        unset($this->$offset);
    }

    /**
     * @return array
     */
    public function getValue()
    {
        $export = [];
        foreach ($this->value as $key => $field) {
            if (is_a($field, InterfaceFieldReturn::class)) {
                $export[$key] = $field->getValue();
            }
        }
        return $export;
    }
}
