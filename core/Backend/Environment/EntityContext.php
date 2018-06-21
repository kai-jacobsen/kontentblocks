<?php

namespace Kontentblocks\Backend\Environment;


use Kontentblocks\Common\Interfaces\EntityInterface;

/**
 * Class EntityContext
 */
class EntityContext implements \JsonSerializable
{

    /**
     * EntityContext constructor.
     * @param array $args
     * @param EntityInterface $entity
     */
    public function __construct($args = [], EntityInterface $entity)
    {
        $this->set($args);
    }

    /**
     * @param $attributes
     * @return $this
     */
    public function set($attributes)
    {
        if (is_array($attributes)) {
            foreach ($attributes as $k => $v) {
                    $this->$k = $v;
            }
        }
        return $this;
    }

    /**
     * @param $prop
     * @param null $default
     * @return null
     */
    public function get($prop, $default = null)
    {
        if (property_exists($this, $prop)) {
            return $this->$prop;
        }
        return $default;
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
        return get_object_vars($this);
    }



}