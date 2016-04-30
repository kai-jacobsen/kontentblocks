<?php

namespace Kontentblocks\Common\Data;

use ArrayAccess;
use JsonSerializable;


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
     * @var bool
     */
    protected $_locked = false;
    /**
     * @var array
     */
    protected $_originalData = array();

    /**
     * @param $data
     * @since 0.1.0
     * @return $this
     */
    public function set($data)
    {
        if (!is_array($data) && !is_null($data)) {
            $this->singleValue = $data;
            return $this;
        }

        if (is_array($data)) {
            foreach ($data as $key => $v) {
                if (is_null($v)) {
                    unset($this->$key);
                }
                $this->$key = $v;
            }
            $this->_originalData = $data;
        }
        return $this;
    }

    /**
     * @param string $offset
     * @param string $default
     * @param null $group
     * @return string
     * @since 0.1.0
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
     * @since 0.1.0
     */
    public function getOriginalData()
    {
        return $this->_originalData;
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
        if (!$this->_locked) {
            $this->$offset = $value;
        } else {
            trigger_error('Module Model is locked', E_USER_WARNING);
        }
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
        if (!$this->_locked) {
            unset($this->$offset);
        } else {
            trigger_error(' Module Model is locked', E_USER_WARNING);
        }
    }

    /**
     * Lock Model write access
     * @return void
     * @since 0.1.0
     */
    public function lock()
    {
        $this->_locked = true;
    }

    /**
     * Unlock Model write access
     * @return void
     * @since 0.1.0
     */
    public function unlock()
    {
        $this->_locked = false;
    }

    /**
     * @return bool
     * @since 0.1.0
     */
    public function hasData()
    {
        return $this->_initialized;
    }

    abstract public function sync();

}