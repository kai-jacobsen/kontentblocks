<?php

namespace Kontentblocks\Fields\Returnobjects;


use Kontentblocks\Fields\Field;

/**
 * Class StandardFieldReturn
 * @package Kontentblocks\Fields\Returnobjects
 */
class StandardFieldReturn implements InterfaceFieldReturn, \ArrayAccess, \JsonSerializable
{

    private $idKey;

    /**
     * @var mixed
     */
    public $value;

    /**
     * @var Field
     */
    protected $field;

    /**
     * @param $value
     * @param Field $field
     */
    public function __construct( $value, Field $field )
    {
        $this->value = $value;
        $this->field = $field;
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
    public function offsetExists( $offset )
    {
        return isset( $this->value[$offset] );
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
    public function offsetGet( $offset )
    {
        return $this->value[$offset];
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
     * @return void
     * @since 5.0.0
     */
    public function offsetSet( $offset, $value )
    {
        $this->value[$offset] = $value;
    }

    /**
     * Offset to unset
     * @link http://php.net/manual/en/arrayaccess.offsetunset.php
     * @param mixed $offset <p>
     * The offset to unset.
     * </p>
     * @return void
     * @since 5.0.0
     */
    public function offsetUnset( $offset )
    {
        unset($this->value[$offset]);
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return $this->value;
    }

    public function handleLoggedInUsers()
    {

    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(){
        if (is_array($this->value)){
            if (!is_null($this->idKey) && array_key_exists($this->idKey, $this->value) && is_string($this->value[$this->idKey])){
                return $this->value[$this->idKey];
            }

            $value = array_values($this->value);
            return $value[0];
        }
        return $this->value;
    }
}