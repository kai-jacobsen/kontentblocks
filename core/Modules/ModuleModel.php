<?php

namespace Kontentblocks\Modules;


/**
 * Class ModuleModel
 * Module Data Container
 *
 * @package Kontentblocks\Modules
 */
class ModuleModel implements \JsonSerializable, \ArrayAccess
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
     *
     * @var array
     */
    private $_originalData = array();

    /**
     * parent Moduel
     * @var Module
     */
    private $Module;

    /**
     * @param array $data
     * @since 0.1.0
     */
    public function __construct( $data = array(), Module $Module )
    {
        $this->Module = $Module;
        $this->_originalData = $data;
        $this->set( $data );
        $this->_initialized = true;
    }

    /**
     * @param $data
     * @since 0.1.0
     */
    public function set( $data )
    {
        if (!is_array( $data )) {
            return;
        }

        foreach ($data as $key => $v) {
            $this->$key = $v;
        }

        wp_parse_args( $this->_originalData, $data );
    }

    /**
     * @param string $offset
     * @param string $default
     * @param null $group
     * @return string
     * @since 0.1.0
     */
    public function get( $offset, $default = '', $group = null )
    {
        if (is_null( $offset )) {
            trigger_error( 'An offset must be specified', E_USER_WARNING );
            return $default;
        }

        if (!is_null( $group )) {
            if (property_exists( $this, $group )) {
                if (!empty( $this->$group[$offset] )) {
                    return $this->$group[$offset];
                } else {
                    return $default;
                }
            }
        }

        if (!empty( $this->$offset )) {
            return $this->$offset;
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

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @return array
     * @since 0.1.0
     */
    public function jsonSerialize()
    {
        $vars = get_object_vars( $this );
        unset( $vars['Module'] );
        unset( $vars['_locked'] );
        unset( $vars['_initialized'] );
        unset( $vars['_originalData'] );
        return $vars;
    }

    /**
     *
     * @return mixed
     * @since 0.1.0
     */
    public function export()
    {
        return $this->jsonSerialize();
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
    public function offsetExists( $offset )
    {
        return property_exists( $this, $offset );
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
    public function offsetGet( $offset )
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
    public function offsetSet( $offset, $value )
    {
        if (!$this->_locked) {
            $this->$offset = $value;
        } else {
            trigger_error( 'Module Model is locked', E_USER_WARNING );
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
    public function offsetUnset( $offset )
    {
        if (!$this->_locked) {
            unset( $this->$offset );
        } else {
            trigger_error( ' Module Model is locked', E_USER_WARNING );
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

    /**
     * @return bool
     * @ince 0.2.0
     */
    public function sync()
    {
        $Storage = $this->Module->Environment->getStorage();
        $result = $Storage->saveModule( $this->Module->getId(), $this->export() );
        $Storage->reset();
        return $result;
    }
}