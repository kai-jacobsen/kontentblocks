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
     * @param $args
     */
    public static function run($args)
    {
        // do nothing
    }


    public function preRender()
    {

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
     * Callback handler
     */
    public function saveCallback($postId, $postObj)
    {
        $postData = Request::createFromGlobals();
        $data = $postData->request->filter($this->baseId, null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        if (empty($data)) {
            return;
        }
        $this->model->reset()->set($postData->request->get($this->baseId));
        $this->save($postData);
    }

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
     * @return mixed
     * @throws \Exception
     */
    public function setupFrontendData()
    {
        foreach ($this->model as $key => $v) {
            /** @var \Kontentblocks\Fields\Field $field */
            $field = $this->fields->getFieldByKey($key);
            $this->model[$key] = (!is_null($field)) ? $field->getFrontendValue() : $v;
        }
        return $this->model;
    }

    /**
     * @return EntityModel
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