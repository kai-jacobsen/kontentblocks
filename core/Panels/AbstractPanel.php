<?php

namespace Kontentblocks\Panels;


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
     * Custom Field Manager Instance
     * @var PanelFieldController
     */
    public $fields;
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
     * @return mixed
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->baseId;
    }

    /**
     * @return array
     */
    public function getProperties()
    {
        return $this->args;
    }

    /**
     * @return mixed
     */
    protected function getType()
    {
        return $this->type;
    }

} 