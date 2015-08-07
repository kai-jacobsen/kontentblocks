<?php

namespace Kontentblocks\Common\Data;

/**
 * Class ValueStorage
 *
 * Kind of standard model to hold and access arbitrary data
 * @package Kontentblocks\Common\Data
 */
class ValueStorage implements ValueStorageInterface, \JsonSerializable
{

    private $value = array();

    /**
     * @param array $data
     */
    public function __construct( $data = array() )
    {
        $this->value = $data;
    }

    /**
     * @param $key
     * @param int $filter
     * @param null $options
     * @return mixed|null
     */
    public function getFiltered( $key, $filter = FILTER_DEFAULT, $options = null )
    {
        if (isset( $this->value[$key] )) {
            return filter_var( $this->value[$key], $filter, $options );
        }
        return null;
    }

    /**
     * @param $key
     * @return null|mixed
     */
    public function get( $key )
    {
        if (isset( $this->value[$key] )) {
            return $this->value[$key];
        }

        return null;
    }

    /**
     * @param $key
     * @param $value
     * @return $this
     */
    public function set( $key, $value )
    {
        $this->value[$key] = $value;
        return $this;
    }

    /**
     * @param $var
     * @return $this
     */
    public function import( $var )
    {
        if (is_object( $var )) {
            $var = get_object_vars( $var );
        }

        if (is_array( $var )) {
            foreach ($var as $k => $v) {
                $this->value[$k] = $v;
            }
        }

        return $this;

    }

    /**
     * @param $key
     * @return $this
     */
    public function delete( $key )
    {
        unset( $this->value[$key] );
        return $this;
    }

    /**
     * @return array
     */
    public function export()
    {
        return $this->value;

    }


    /**
     * @param $key
     * @return bool
     */
    public function exists($key){
        return array_key_exists($key, $this->value);
    }


    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return $this->value;
    }
}