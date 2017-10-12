<?php

namespace Kontentblocks\Common\Data;

use ArrayIterator;
use Kontentblocks\Fields\Definitions\ReturnObjects\InterfaceFieldReturn;
use Kontentblocks\Fields\Definitions\ReturnObjects\StandardFieldReturn;
use Kontentblocks\Utils\Utilities;
use Traversable;


/**
 * Class ValueObject
 * @package Kontentblocks\Common\Data
 */
class ValueObject implements ValueObjectInterface, \ArrayAccess, \JsonSerializable, \IteratorAggregate
{

    /**
     * @var array
     */
    protected $data = [];


    /**
     * ValueObject constructor.
     * @param array $data
     */
    public function __construct($data = [])
    {
        $this->set($data);
    }

    /**
     * @param $data
     * @return $this
     */
    public function set($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $v) {
                if (is_null($v)) {
                    unset($this->data[$key]);
                }
                $this->data[$key] = $v;
            }
        }
        return $this;
    }

    /**
     * @return array
     */
    public function getAll()
    {
        return $this->data;
    }

    /**
     * @param $name
     * @return mixed
     */
    public function __get($name)
    {
        return $this->get($name);
    }

    /**
     * @param $key
     * @param $value
     */
    public function __set($key, $value)
    {
        $this->offsetSet($key, $value);
    }

    /**
     * @param $key
     * @param null $default
     * @param null $group
     * @return mixed
     */
    public function get($key, $default = null, $group = null)
    {
        $value = $default;

        $isPrivate = false;
        if (is_string($key) && !empty($key)) {
            if ($key[0] === '_') {
                $isPrivate = true;
                $key = ltrim($key, '_');
            }
        }

        if (!is_null($group)) {
            if (array_key_exists($group, $this->data)) {
                if (!empty($this->data[$group][$key])) {
                    $value = $this->data[$group][$key];
                } else {
                    $value = $default;
                }
            }
        }

        if (isset($this->data[$key])) {
            $value = $this->data[$key];
        }

        if (is_a($value, InterfaceFieldReturn::class) && $isPrivate) {
            $value = $value->getValue();
        }

        return $value;
    }

    /**
     * Offset to set
     * @link http://php.net/manual/en/arrayaccess.offsetset.php
     * @param mixed $offset <p>
     * The offset to assign the value to.
     * </p>
     * @param mixed $value <p>
     * The value to set.
     * </p>
     * @return self
     * @since 5.0.0
     */
    public function offsetSet($offset, $value)
    {
        $data = array(
            $offset => $value
        );
        return $this->set($data);
    }

    /**
     * @param $key
     * @return bool
     */
    public function __isset($key)
    {
        return $this->offsetExists($key);
    }

    /**
     * Whether a offset exists
     * @link http://php.net/manual/en/arrayaccess.offsetexists.php
     * @param mixed $offset <p>
     * An offset to check for.
     * </p>
     * @return boolean true on success or false on failure.
     * </p>
     * <p>
     * The return value will be casted to boolean if non-boolean was returned.
     * @since 5.0.0
     */
    public function offsetExists($offset)
    {
        return isset($this->data[$offset]);
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return $this->data;
    }

    /**
     * Offset to retrieve
     * @link http://php.net/manual/en/arrayaccess.offsetget.php
     * @param mixed $offset <p>
     * The offset to retrieve.
     * </p>
     * @return mixed Can return all value types.
     * @since 5.0.0
     */
    public function offsetGet($offset)
    {
        return $this->data[$offset];
    }

    /**
     * Offset to unset
     * @link http://php.net/manual/en/arrayaccess.offsetunset.php
     * @param mixed $offset <p>
     * The offset to unset.
     * </p>
     * @return self
     * @since 5.0.0
     */
    public function offsetUnset($offset)
    {
        unset($this->data[$offset]);
        return $this;
    }

    /**
     * @return array
     */
    public function gVCardetOriginalData()
    {
        return $this->export();
    }

    /**
     * @return array
     */
    public function export()
    {
        $data = $this->data;
        $exportData = [];
        foreach ($data as $key => $value) {
            if (!empty($key) && $key[0] !== '_') {
                $exportData[$key] = $value;
            }

            if (is_object($value) && is_a($value, InterfaceFieldReturn::class)) {
                $exportData[$key] = $value->getValue();
            }
        }

        return $exportData;
    }

    /**
     * @return bool
     */
    public function hasData()
    {
        return !empty($this->data);
    }

    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return $this->export();
    }

    /**
     * @return $this
     */
    public function reset()
    {
        $this->data = [];
        return $this;
    }


    /**
     * Retrieve an external iterator
     * @link http://php.net/manual/en/iteratoraggregate.getiterator.php
     * @return Traversable An instance of an object implementing <b>Iterator</b> or
     * <b>Traversable</b>
     * @since 5.0.0
     */
    public function getIterator()
    {
        return new ArrayIterator($this->export());
    }
}