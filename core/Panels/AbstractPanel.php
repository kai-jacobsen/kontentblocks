<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\DataProviderInterface;
use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class AbstractPanel
 * @package Kontentblocks\Panels
 */
abstract class AbstractPanel implements EntityInterface
{

    public $saveAsSingle;
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
     * @var PanelModel
     */
    public $model;
    /**
     * @var StandardFieldController
     */
    public $fields;
    /**
     * @var DataProviderInterface
     */
    protected $dataProvider;
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
     * @var PanelModel
     */
    protected $frontendModel;

    /**
     * @param $args
     */
    public static function run($args)
    {
        // do nothing
    }


    public function preRender()
    {
        return '';
    }

    /**
     * @return mixed
     */
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

    abstract public function getProperties();

    abstract public function getContext();

    /**
     * Callback handler
     * @param $objectId
     * @param $objectObject
     * @return
     */
    abstract public function saveCallback($objectId, $objectObject);

    /**
     * @param Request $postData
     * @return mixed|void
     */
    public function save(Request $postData)
    {
        $old = $this->dataProvider->get($this->baseId);
        $new = $this->fields->save($postData->request->get($this->baseId), $old);
        $merged = Utilities::arrayMergeRecursive($new, $old);
        $this->model->set($merged)->sync();
        if ($this->saveAsSingle) {
            $this->model->saveasSingle();
        }
    }

    /**
     * @return EntityModel
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
     * @return array
     */
    public function getArgs(){
        return $this->args;
    }


    /**
     * @return string
     */
    public function getType()
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

    /**
     * @return PanelModel
     * @deprecated
     */
    public function setupFrontendData()
    {
        return $this->setupViewModel();
    }

    /**
     * @param bool $forcenew
     * @return PanelModel
     */
    public function setupViewModel($forcenew = false)
    {
        if (!is_null($this->frontendModel)) {
            if ($forcenew === false) {
                return $this->frontendModel;
            }
        }

        $prepData = [];
        foreach ($this->model->export() as $key => $v) {
            /** @var \Kontentblocks\Fields\Field $field */
            $field = $this->fields->getFieldByKey($key);
            if (!is_null($field)) {
                $field->setData($v);
                $prepData[$key] = (!is_null($field)) ? $field->getFrontendValue() : $v;
            } else {
                unset($this->model[$key]);
            }
        }
        $fModel = new PanelModel($prepData, $this);
        $this->frontendModel = $fModel;
        return $this->frontendModel;
    }

    /**
     * @return PanelModel
     */
    public function setupRawData()
    {
        $fields = $this->fields->collectAllFields();
        if (!empty($fields) && is_array($fields)) {
            /** @var Field $field */
            foreach ($fields as $field) {
                $this->model->set(array(
                    $field->getKey() => $field->getValue()
                ));
            }
        }
        return $this->model;
    }
}