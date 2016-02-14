<?php
namespace Kontentblocks\Fields;

use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Fields\Renderer\AbstractFieldRenderer;
use Kontentblocks\Fields\Renderer\InterfaceFieldRenderer;

/**
 * Class AbstractFieldController
 * @package Kontentblocks\Fields
 */
class StandardFieldController
{

    /**
     * Collection of added Sections / Fields ...
     * @var array
     * @since 0.1.0
     */
    public $sections;

    /**
     * @var EntityModel
     */
    public $model;

    /**
     * @var EntityInterface
     */
    public $entity;

    /**
     * @var InterfaceFieldRenderer
     */
    public $renderEngine;

    /**
     * Baseid, as passed to fields
     * @var string
     */
    public $baseId;


    /**
     * Default field renderer
     * @var InterfaceFieldRenderer
     */
    protected $renderer = 'Kontentblocks\Fields\Renderer\FieldRendererTabs';

    /**
     * @var string
     */
    public $fieldFormRenderer = '\Kontentblocks\Fields\FieldFormRenderer';

    /**
     * registered fields in one flat array
     * @var array
     * @since 0.1.0
     */
    protected $fieldsById;

    /**
     * AbstractFieldController constructor.
     * @param $baseid
     * @param EntityInterface $entity
     */
    public function __construct($baseid, EntityInterface $entity)
    {
        $this->baseId = $baseid;
        $this->entity = $entity;
        $this->model = $entity->getModel();
    }


    /**
     * @return EntityInterface
     */
    public function getEntity()
    {
        return $this->entity;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->baseId;
    }

    /**
     * Prepare fields for frontend output
     * @return $this
     *
     * @since 0.1.0
     */
    public function updateData()
    {
        if (empty($this->fieldsById)) {
            $this->fieldsById = $this->collectAllFields();
        }

        $model = $this->getModel()->export();
        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fieldsById as $field) {
            $data = (array_key_exists($field->getKey(), $model)) ? $model[$field->getKey()] : '';
            $field->setData($data);
        }
        return $this;
    }

    /**
     * Extract single fields from sections
     * and stores them in one single flat array
     * @return array
     * @since 0.1.0
     */
    public function collectAllFields()
    {
        $collect = array();
        /** @var StandardFieldSection $def */
        foreach ($this->sections as $def) {
            if (!is_null($def->getFields())) {
                $collect = $collect + $def->getFields();
            }
        }
        return $collect;

    }

    /**
     * @return EntityModel
     */
    public function getModel()
    {
        return $this->entity->getModel();
    }

    /**
     * Get a field object by key
     * returns the object on success
     * or false if key does not exist
     *
     * @param string $key
     *
     * @param null $fromArray
     * @return mixed
     * @since 0.1.0
     */
    public function getFieldByKey($key, $fromArray = null)
    {
        if (empty($this->fieldsById)) {
            $this->fieldsById = $this->collectAllFields();
        }

        if (isset($fromArray) && $this->fieldsById[$fromArray]) {
            return $this->fieldsById[$fromArray]->getFieldByKey($key);
        }

        if (isset($this->fieldsById[$key])) {
            return $this->fieldsById[$key];
        } else {
            false;
        }

    }

    /**
     * Calls save on each group
     * propagates the save event to sections
     *
     * @param $data
     * @param $oldData
     *
     * @return array
     * @since 0.1.0
     */
    public function save($data, $oldData)
    {
        $collection = array();
        /** @var StandardFieldSection $section */
        foreach ($this->sections as $section) {
            $return = ($section->save($data, $oldData));
            $collection = $collection + $return;
        }
        return $collection;

    }

    /**
     * @param $sectionId
     * @param array $args
     * @return object
     * @deprecated
     */
    public function addGroup($sectionId, $args = array())
    {
        return $this->addSection($sectionId, $args = array());
    }

    /**
     * Creates a new section if there is not an exisiting one
     * or returns the section
     *
     * @param string $sectionId
     * @param array $args
     *
     * @return StandardFieldSection
     */
    public function addSection($sectionId, $args = array())
    {
        if (!$this->idExists($sectionId)) {
            $this->sections[$sectionId] = new StandardFieldSection($sectionId, $args, $this);
        }
        return $this->sections[$sectionId];
    }

    /**
     * Helper method to check whether an section already
     * exists in group
     *
     * @param string $sectionId
     *
     * @return object
     * @since 0.1.0
     */
    public function idExists($sectionId)
    {
        return (isset($this->sections[$sectionId]));
    }

    /**
     * @return array
     */
    public function export()
    {
        $collection = array();
        foreach ($this->sections as $section) {
            $section->export($collection);
        }
        return $collection;
    }

    /**
     * @return AbstractFieldRenderer
     */
    public function getRenderer()
    {

        if (is_null($this->renderer)) {
            $this->renderer = '\Kontentblocks\Fields\Renderer\FieldRendererTabs';
        }

        if (is_null($this->renderEngine)) {
            $this->renderEngine = new $this->renderer($this);
        }
        return $this->renderEngine;
    }

    /**
     * @param string $classname
     */
    public function setRenderer($classname)
    {
        if (is_string($classname) && is_a(
                $classname,
                '\Kontentblocks\Fields\Renderer\InterfaceFieldRenderer',
                true
            )
        ) {
            $this->renderer = $classname;
        }
    }

    /**
     * @param $string
     */
    public function setFieldFormRenderer($string)
    {
        if (is_a($string, '\Kontentblocks\Fields\FieldFormRenderer', true)) {
            $this->fieldFormRenderer = $string;
        }
    }

}