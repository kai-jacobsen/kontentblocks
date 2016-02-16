<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\DataProviderInterface;
use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Fields\PanelFieldController;

/**
 * Class AbstractPanel
 * @package Kontentblocks\Panels
 */
abstract class AbstractPanel implements EntityInterface
{

    /**
     * @var DataProviderInterface
     */
    protected $dataProvider;

    /**
     * Form data
     * @var array
     */
    public $data = null;

    /**
     * @var string
     */
    public $type;

    /**
     * @var EntityModel
     */
    public $model;


    /**
     * @var array
     */

    protected $args;
    /**
     * Key / base id
     * @var string
     */
    protected $baseId;


    /**
     * @param $args
     */
    public static function run($args)
    {
        // do nothing
    }


    abstract public function init();

    /**
     * Prepare and return data for user usage
     * @return mixed
     */
    abstract public function getData();

    /**
     * @param $data
     */
    public function setData($data)
    {
        $this->data = $data;
    }

    /**
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @param null $default
     * @return mixed
     */
    abstract public function getKey($key = null, $default = null);

    /**
     * @return string
     */
    public function getBaseId()
    {
        return $this->baseId;
    }


    /**
     * @return string
     */
    public function getId()
    {
        return $this->baseId;
    }

    public function getProperties()
    {
        // TODO: Implement getProperties() method.
    }

    /**
     * @return PanelModel
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * Auto setup args to class properties
     * and look for optional method for each arg
     * @param $args
     */
    public function setupArgs($args)
    {
        foreach ($args as $k => $v) {
            if (method_exists($this, "set" . strtoupper($k))) {
                $method = "set" . strtoupper($k);
                $this->$method($v);
            } else {
                $this->$k = $v;
            }
        }
    }

    /**
     * @return string
     */
    protected function getType()
    {
        return $this->type;
    }

    /**
     * @return DataProviderInterface
     */
    public function getDataProvider()
    {
        return $this->dataProvider;
    }
}