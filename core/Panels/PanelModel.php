<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Interfaces\EntityInterface;

/**
 * Class PanelModel
 * @package Kontentblocks\Panels
 */
class PanelModel extends EntityModel
{

    public $_originalData;

    /**
     * @var EntityInterface
     */
    private $entity;

    /**
     * @param array $data
     * @param AbstractPanel $entity
     * @since 0.1.0
     */
    public function __construct($data = array(), AbstractPanel $entity)
    {
        $this->_originalData = $data;
        $this->set($data);
        $this->_initialized = true;
        $this->entity = $entity;
    }

    /**
     * @return mixed
     */
    public function sync()
    {
        $provider = $this->entity->getDataProvider();

        return $provider->update($this->entity->getId(), $this->export());
    }

    /**
     * @return mixed
     */
    public function export()
    {
        return $this->jsonSerialize();

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
        $vars = get_object_vars($this);
        unset($vars['_locked']);
        unset($vars['_initialized']);
        unset($vars['_originalData']);
        unset($vars['entity']);
        return $vars;
    }
}