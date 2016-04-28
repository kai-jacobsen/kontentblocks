<?php

namespace Kontentblocks\Fields;

use Exception;
use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Exportable;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class StandardFieldSection
 * @package Kontentblocks\Fields
 */
class StandardFieldSection implements Exportable
{

    /**
     * Preset defaults
     * @var array
     */
    public static $defaults = array(
        'label' => 'Fieldgroup',
        'title' => 'Fieldgrouptitle',
        'attributes' => array('class' => 'kbf-section-wrap')
    );

    /**
     * @var array
     */
    public $args;

    /**
     * Unique identifier
     * @var string id unique identifier
     */
    public $sectionId;

    /**
     * @var string
     */
    public $baseId;

    /**
     * @var StandardFieldController
     */
    public $controller;

    /**
     * @var EntityInterface
     */
    public $entity;


    /**
     * Array of registered fields for this section
     * @var array
     */
    protected $fields;

    /**
     * Counter for actual fields to render
     * @var int
     */
    protected $numberOfVisibleFields = 0;

    /**
     * Counter for total number of added fields in this section
     * @var int
     */

    protected $numberOfFields = 0;

    /**
     * ordering index
     * @var int
     */
    private $priorityCount = 10;


    /**
     * Constructor
     *
     * @param string $sectionId
     * @param $args
     * @param StandardFieldController $controller
     */
    public function __construct($sectionId, $args, StandardFieldController $controller)
    {
        $this->sectionId = $sectionId;
        $this->args = $this->prepareArgs($args);
        $this->controller = $controller;
        $this->baseId = $controller->getId();
        //shorthand
        $this->entity = $controller->getEntity();
    }

    /**
     * @param $args
     * @return array
     */
    public function prepareArgs($args)
    {
        return Utilities::arrayMergeRecursive($args, self::$defaults);

    }

    /**
     * Add a field definition to the group field collection
     *
     * @param string $type | Type of form field
     * @param string $key | Unique key
     * @param array $args | additional parameters, may differ by field type
     *
     * @throws \Exception
     * @return StandardFieldSection Fluid layout
     */
    public function addField($type, $key, $args = array())
    {
        $subkey = null;


        if (isset($args['adminOnly']) && ($args['adminOnly'] === true) ){
            if (!is_admin()){
                return $this;
            }
        }

        if (!$this->fieldExists($key)) {
            //check for special key syntax
            if (preg_match("/^(.*?)::/i", $key, $out)) {
                if (is_array($out) && count($out) == 2) {
                    $key = str_replace($out[0], '', $key);
                    if (isset($args['arrayKey']) && $args['arrayKey'] !== $out[1]) {
                        throw new Exception(
                            'ArrayKey mismatch. Field key has :: syntax and arrayKey arg is set, but differs'
                        );
                    }
                    $args['arrayKey'] = $subkey = $out[1];
                }
            } else if (isset($args['arrayKey'])){
                $subkey = $args['arrayKey'];
            }


            if (!isset($args['priority'])) {
                $args['priority'] = $this->priorityCount;
                $this->priorityCount += 5;
            }

            /** @var \Kontentblocks\Fields\FieldRegistry $registry */
            $registry = Kontentblocks::getService('registry.fields');
            $field = $registry->getField($type, $this->baseId, $subkey, $key, $args);
            $field->setController($this->controller);
            if (!$field) {
                throw new Exception("Field of type: $type does not exist");
            } else {
                $field->section = $this;
                // conditional check of field visibility
                $this->markVisibility($field);

                // Fields with same arrayKey gets grouped into own collection
                if (isset($args['arrayKey'])) {
                    $newField = $this->addArrayField($field, $key, $args);
                } else {
                    $this->fields[$key] = $newField = $field;
                }


                $data = $this->getEntityModel();
                if (!is_a($newField, '\Kontentblocks\Fields\FieldSubGroup')) {
                    if (isset($data[$newField->getKey()])) {
                        $fielddata = (is_object($data) && !is_null(
                                $data[$newField->getKey()]
                            )) ? $data[$newField->getKey()] : $this->getFieldStd($newField);
                    } else {
                        $fielddata = $this->getFieldStd($newField);
                    }
                } else {
                    $fielddata = (isset($data[$newField->getKey()])) ? $data[$newField->getKey()] : array();
                }
                $newField->setData($fielddata);
                $this->increaseVisibleFields();
                $this->orderFields();
            }
        }
        return $this;
    }

    /**
     * Test if a key already exists
     *
     * @param string $key
     *
     * @return bool
     */
    public function fieldExists($key)
    {
        return isset($this->fields[$key]);
    }

    /**
     * Set visibility of field based on environment vars given by the Panel
     * Panels have no envVars yet so all fields are visible
     *
     * @param Field $field
     *
     * @return mixed
     */
    public function markVisibility(Field $field)
    {
        $field->setDisplay(true);
    }

    /**
     * Handle special array notation
     *
     * @param Field $field
     * @param string $key
     * @param array $args
     * @return FieldSubGroup
     */
    public function addArrayField($field, $key, $args)
    {
        if (!$this->fieldExists($args['arrayKey'])) {
            /** @var FieldSubGroup $fieldArray */
            $fieldArray = $this->fields[$args['arrayKey']] = new FieldSubGroup($args['arrayKey']);
        } else {
            $fieldArray = $this->fields[$args['arrayKey']];
        }
        $fieldArray->addField($key, $field);
        return $fieldArray;
    }

    /**
     * @return EntityModel
     */
    public function getEntityModel()
    {
        return $this->entity->getModel();
    }

    /**
     * Get field default value
     *
     * @param $field
     *
     * @return mixed defaults to empty string
     */
    private function getFieldStd(Field $field)
    {
        return $field->getArg('std', '');

    }

    /**
     * Increase number of visible fields property
     */
    protected function increaseVisibleFields()
    {
        $this->numberOfVisibleFields++;
        $this->numberOfFields++;

    }

    private function orderFields()
    {
        $code = "return strnatcmp(\$a->getArg('priority'), \$b->getArg('priority'));";
        uasort($this->fields, create_function('$a,$b', $code));

    }

    /**
     * Wrapper method
     * Sets essential properties
     * Calls render() on each field
     */
    public function render()
    {
        if (empty($this->fields)) {
            return;
        }

        $flatten = $this->flattenFields();

        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($flatten as $field) {
            $field->build();
        }
    }

    /**
     * @return array
     */
    public function flattenFields()
    {
        $flatten = array();

        if (empty($this->fields)) {
            return $flatten;
        }

        foreach ($this->fields as $field) {
            if (is_a($field, '\Kontentblocks\Fields\FieldSubGroup')) {
                /** @var FieldSubGroup $field */
                /** @var Field $subfield */
                foreach ($field->getFields() as $subfield) {
                    $flatten[] = $subfield;
                }
            } else {
                $flatten[] = $field;
            }
        }
        return $flatten;
    }

    /**
     * Calls save on fields and collects the results in one array
     *
     * @param array $data new data
     * @param array $oldData previous data
     *
     * @return array
     */
    public function save($data, $oldData)
    {
        $collect = array();

        if (!is_array($this->fields)) {
            return $oldData;
        }
        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fields as $field) {
            $old = (isset($oldData[$field->getKey()])) ? $oldData[$field->getKey()] : null;
            if (isset($data[$field->getKey()])) {
                $collect[$field->getKey()] = $field->_save($data[$field->getKey()], $old);
            } else {
                if (is_a($field, '\Kontentblocks\Fields\FieldSubGroup') || $field->getSetting('forceSave')) {
                    // calls save on field if key is not present
                    $collect[$field->getKey()] = $field->_save(null, $old);
                }
            }
        }

        return $collect;
    }

    /**
     * Getter to retrieve all registered fields
     * @return array
     */
    public function getFields()
    {
        return $this->fields;

    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->args['label'];
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->args['title'];
    }

    /**
     * ID getter
     * @return string
     */
    public function getSectionId()
    {
        return $this->sectionId;

    }

    /**
     * Getter Number of visible fields
     * @return int
     */
    public function getNumberOfVisibleFields()
    {
        return $this->numberOfVisibleFields;

    }

    /**
     * @param $collection
     */
    public function export(&$collection)
    {
        if (empty($this->fields) || is_null($this->fields)) {
            return array();
        }
        foreach ($this->fields as $field) {
            $field->export($collection);
        }
    }

    /**
     * @return EntityInterface
     */
    public function getEntity()
    {
        return $this->entity;
    }

    /**
     * Descrease number of visible fields property
     */
    protected function decreaseVisibleFields()
    {
        $this->numberOfVisibleFields--;

    }


} 