<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Utils\Utilities;

/**
 * Class PanelModel
 */
class PanelModel extends EntityModel
{

    protected $originalData;

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
        $this->originalData = $data;
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
        $key = Utilities::buildContextKey($this->entity->getId());
        if (!Utilities::isPreview()) {
            $provider->delete('_preview_' . $this->entity->getId());
        }

        return $provider->update($key, $this->export());
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
        unset($vars['_initialized']);
        unset($vars['originalData']);
        unset($vars['entity']);
        return $vars;
    }

    public function saveAsSingle()
    {
        $dataProvider = $this->entity->getDataProvider();
        foreach ($this->export() as $k => $v) {
            if (empty($v)) {
                $dataProvider->delete($this->entity->getId() . '_' . $k);
            } else {
                $dataProvider->update($this->entity->getId() . '_' . $k, $v);
            }
        }
    }

    /**
     * @return $this
     */
    public function reset()
    {
        $keys = array_keys($this->export());
        foreach ($keys as $key) {
            unset($this->$key);
        }
        $this->originalData = array();
        return $this;
    }
}