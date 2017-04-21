<?php

namespace Kontentblocks\Common\Data;

use ArrayAccess;
use JsonSerializable;
use Kontentblocks\Utils\Utilities;


/**
 * Class EntityModel
 * @package Kontentblocks\Common\Data
 */
abstract class EntityModel implements JsonSerializable, ArrayAccess
{

    /**
     * @var bool
     */
    protected $_initialized = false;
    /**
     * @var array
     */
    protected $originalData = array();

    /**
     * @param $data
     * @return $this
     */
    public function set($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $v) {
                if (is_null($v)) {
                    unset($this->$key);
                }
                $this->$key = $v;
            }
            $this->originalData = Utilities::arrayMergeRecursive($data, $this->originalData);
        }
        return $this;
    }

    /**
     * @param string $offset
     * @param string $default
     * @param null $group
     * @return string
     */
    public function get($offset, $default = '', $group = null)
    {
        if (!is_null($group)) {
            if (property_exists($this, $group)) {
                if (!empty($this->$group[$offset])) {
                    return $this->$group[$offset];
                } else {
                    return $default;
                }
            }
        }

        if (!empty($this->$offset)) {
            $value = $this->$offset;

            if (is_object($value)) {
                $value = $value->value;
            }

            if (empty($value)) {
                return $default;
            }

            return $value;
        }

        return $default;
    }

    /**
     * @return array
     */
    public function getOriginalData()
    {
        return $this->originalData;
    }

    abstract public function export();

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
     * @return bool
     */
    public function hasData()
    {
        return $this->_initialized;
    }

    abstract public function sync();

}