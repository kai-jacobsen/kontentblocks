<?php

namespace Kontentblocks\Fields;

use Exception;
use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\ExportableFieldInterface;
use Kontentblocks\Common\Interfaces\EntityInterface;
use function Kontentblocks\fieldRegistry;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class StandardFieldSection
 * @package Kontentblocks\Fields
 */
class StandardFieldSection implements ExportableFieldInterface
{

    /**
     * Preset defaults
     * @var array
     */
    public static $defaults = array(
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
    public $tabs = [];
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
    private $priorityIndex = 10;

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
        $this->args = $this->setupArgs($args);
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
    private function setupArgs($args)
    {
        $args = Utilities::arrayMergeRecursive($args, self::$defaults);
        if (!isset($args['label'])) {
            $args['label'] = ucfirst(str_replace('-', ' ', $this->sectionId));
        }
        if (!isset($args['title'])) {
            $args['title'] = ucfirst(str_replace('-', ' ', $this->sectionId));
        }
        if (!isset($args['description'])) {
            $args['description'] = '';
        }

        return $args;
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
     * @return StandardFieldSection Fluid layout
     */
    public function addField($type, $key, $args = array())
    {

        if (is_string($key) && empty($key)) {
            return $this;
        }

        if (is_string($key) && $key[0] === '_') {
            return $this;
        }


        /** @var \Kontentblocks\Fields\FieldRegistry $registry */
        $registry = Kontentblocks::getService('registry.fields');

        // don't init admin-only fields
        if (isset($args['adminOnly']) && ($args['adminOnly'] === true)) {
            if (!is_admin()) {
                return $this;
            }
        }

        if (!$registry->validType($type)) {
            return $this;
        }

        if (!$this->fieldExists($key)) {
            $groupkey = $this->evaluateGroupKey($args, $key);
            $args['arrayKey'] = $groupkey;
            if (!isset($args['priority'])) {
                $args['priority'] = $this->getPriorityIndex();
            }

            $field = $registry->getField($type, $this->baseId, $groupkey, $key, $args);

            // a field might only work for certain entities
            if (is_array($field->getSetting('restriction'))) {
                if (!in_array($this->entity->getType(), $field->getSetting('restriction'))) {
                    return $this;
                }
            }

            $field->setController($this->controller);
            $field->setSection($this);
            $this->markVisibility($field);
            // conditional check of field visibility
            // Fields with same arrayKey gets grouped into own collection
            if (!is_null($groupkey)) {
                $field = $this->attachGroupField($groupkey, $field, $key, $args);
            } else {
                $this->fields[$key] = $field;
            }

            $this->collectToTabs($field);
//            $field->setData($this->getFielddata($field));
            $this->increaseVisibleFields();
            $this->orderFields();
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
        $prio = $this->priorityIndex;
        $this->priorityIndex += 5;
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

    /**
     * @param Field $field
     * @return $this
     */
    private function collectToTabs(ExportableFieldInterface $field)
    {

        $fields = [$field];
        if (is_a($field, FieldSubGroup::class)) {
            $fields = $field->getFields();
        }

        foreach ($fields as $field) {
            $tabArg = $field->getArg('tab', null);
            if (is_null($tabArg)) {
                $group = $this->getTabGroup($field->getArg('label'), $field->getKey());
            } else {
                $group = $this->getTabGroup($tabArg);
            }
            $group->addField($field);
            $field->setGroup($group);

        }

    }

    /**
     * @param $label
     * @param null $tabid
     * @return FieldTabGroup|mixed
     */
    private function getTabGroup($label, $tabid = null)
    {

        if (is_null($tabid)) {
            $tabid = sanitize_key($label);
        }
        if (isset($this->tabs[$tabid])) {
            return $this->tabs[$tabid];
        }

        $group = new FieldTabGroup($label, $tabid);
        $this->tabs[$tabid] = $group;
        return $group;


    }

    /**
     * @param $field
     * @return mixed
     */
    private function getFielddata(ExportableFieldInterface $field)
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
        uasort($this->fields, function ($a, $b){
           return strnatcmp($a->getArg('priority'), $b->getArg('priority'));
        });
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
    public function save(
        $data,
        $oldData
    ) {
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
    public function export(
        FieldExport $exporter
    ) {
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
     * @return array
     */
    public function getInvisibleFields()
    {
        $fields = array_filter($this->flattenFields(), function ($field) {
            /** @var Field $field */
            return !$field->isVisible();
        });
        return $fields;
    }

    public function addFieldTemplate($tplid)
    {
        $registry = fieldRegistry();
        $tplid = (array)$tplid;
        foreach ($tplid as $id) {
            if ($registry->fieldTemplateExists($id)) {
                $callback = $registry->getFieldTemplate($id);
                if (is_callable($callback)) {
                    call_user_func($callback, $this);
                }
            }
        }

        return $this;
    }

    /**
     * Descrease number of visible fields property
     */
    protected function decreaseVisibleFields()
    {
        $this->numberOfVisibleFields--;
    }


} 