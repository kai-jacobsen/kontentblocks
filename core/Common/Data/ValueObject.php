<?php

namespace Kontentblocks\Common\Data;

use ArrayIterator;
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
     * @var array
     */
    protected $originalData = [];

    /**
     * ValueObject constructor.
     * @param array $data
     */
    public function __construct($data = [])
    {
        $this->set($data);
        $this->originalData = $data;
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
            $this->originalData = Utilities::arrayMergeRecursive($data, $this->originalData);
        }
        return $this;
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
        if (!is_null($group)) {
            if (array_key_exists($group, $this->data)) {
                if (!empty($this->data[$group][$key])) {
                    return $this->data[$group][$key];
                } else {
                    return $default;
                }
            }
        }

        if (isset($this->data[$key])) {
            return $this->data[$key];
        }

        return $default;
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
    public function getOriginalData()
    {
        return $this->originalData;
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
     * @return array
     */
    public function export()
    {
        $data = $this->data;
        foreach ($data as $key => $value) {
            if ($key[0] === '_') {
                unset($data[$key]);
            }
        }
        return $data;
    }

    /**
     * @return $this
     */
    public function reset()
    {
        $this->data = [];
        $this->originalData = [];
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