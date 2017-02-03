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
     * @var string
     */
    public $uid;
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
        $this->uid = $this->prepareUid();
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
     * Unique section id
     * @return string
     */
    private function prepareUid()
    {
        $args = $this->args;
        $args['salt'] = $this->baseId;
        return 'kbsec-' . md5(json_encode($args));
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


        /** @var \Kontentblocks\Fields\FieldRegistry $registry */
        $registry = Kontentblocks::getService('registry.fields');

        // don't init admin-only fields
        if (isset($args['adminOnly']) && ($args['adminOnly'] === true)) {
            if (!is_admin()) {
                return $this;
            }
        }

        if (!$registry->validType($type)){
            return $this;
        }

        if (!$this->fieldExists($key)) {
            $groupkey = $this->evaluateGroupKey($args, $key);
            $args['arrayKey'] = $groupkey;
            if (!isset($args['priority'])) {
                $args['priority'] = $this->getPriorityIndex();
            }

            $field = $registry->getField($type, $this->baseId, $groupkey, $key, $args);
            $field->setController($this->controller);
            if (!$field) {
                throw new Exception("Field of type: $type does not exist");
            } else {
                $field->setSection($this);
                $this->markVisibility($field);
                // conditional check of field visibility
                // Fields with same arrayKey gets grouped into own collection
                if (!is_null($groupkey)) {
                    $field = $this->attachGroupField($groupkey, $field, $key, $args);
                } else {
                    $this->fields[$key] = $field;
                }

                $field->setData($this->getFielddata($field));
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
     * @param $args
     * @param $key
     * @return null
     * @throws Exception
     */
    private function evaluateGroupKey($args, &$key)
    {
        //check for special key syntax like group::key
        if (preg_match("/^(.*?)::/i", $key, $out)) {
            if (is_array($out) && count($out) == 2) {
                if (isset($args['arrayKey']) && $args['arrayKey'] !== $out[1]) {
                    throw new Exception(
                        'ArrayKey mismatch. Field key has :: syntax and arrayKey arg is set, but differs'
                    );
                }
                $key = str_replace($out[0], '', $key);
                $args['arrayKey'] = $out[1];
                return $args['arrayKey'];
            }
        } else if (isset($args['arrayKey'])) {
            return $args['arrayKey'];
        }

        return null;
    }

    /**
     * @return int
     */
    private function getPriorityIndex()
    {
        $prio = $this->priorityCount;
        $this->priorityCount += 5;
        return $prio;

    }

    /**
     * Set visibility of field based on environment vars given by the Panel
     * @param Field $field
     *
     * @return mixed
     */
    public function markVisibility(Field $field)
    {
        $field->setVisibility(true);
    }

    /**
     * Handle special array notation
     *
     * @param $groupkey
     * @param Field $field
     * @param string $key
     * @param array $args
     * @return FieldSubGroup
     */
    public function attachGroupField($groupkey, $field, $key, $args)
    {
        $group = $this->addGroup($groupkey, $args);
        $group->addField($key, $field);
        return $group;
    }

    /**
     * @param $groupkey
     * @param array $args
     * @return FieldSubGroup|mixed
     */
    public function addGroup($groupkey, $args = array())
    {
        if (!isset($args['priority']) || is_numeric($args['priority'])) {
            $args['priority'] = $this->getPriorityIndex();
        }

        if (!$this->fieldExists($groupkey)) {
            /** @var FieldSubGroup $fieldArray */
            return $this->fields[$groupkey] = new FieldSubGroup($groupkey, $args, $this);
        } else if (is_a($this->fields[$groupkey], '\Kontentblocks\Fields\FieldSubGroup')) {
            return $this->fields[$groupkey];
        }
    }


    private function getFielddata($field)
    {
        $data = $this->getEntityModel();
        if (isset($data[$field->getKey()])) {
            return (is_object($data) && !is_null(
                    $data[$field->getKey()]
                )) ? $data[$field->getKey()] : $field->getDefaultValue();
        }

        return $field->getDefaultValue();

    }

    /**
     * @return EntityModel
     */
    public function getEntityModel()
    {
        return $this->entity->getModel();
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
     * @param FieldExport $exporter
     * @return array
     */
    public function export(FieldExport $exporter)
    {
        if (empty($this->fields) || is_null($this->fields)) {
            return array();
        }
        /** @var Field $field */
        foreach ($this->fields as $field) {
            $field->export($exporter);
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