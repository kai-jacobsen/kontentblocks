<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\FieldRegistry,
    Kontentblocks\Fields\FieldArray;

/**
 * Purpose of this Class:
 *
 * This serves as a collection handler for fields and offers
 * methods to interact with registered fields.
 *
 * Gets instantiated by Kontentblocks\Fields\FieldManager when
 * addGroup() is called
 *
 * @see Kontentblocks\Fields\FieldManager::addSection()
 * @package Fields
 * @since 1.0.0
 */
class FieldSection
{

    /**
     * Unique identifier
     * @var string
     */
    public $id;

    /**
     * Array of registered fields for this section
     * @var array
     */
    protected $fields;

    /**
     * Preset defaults
     * @var array
     */
    public static $defaults = array(
        'label' => 'Fieldgroup',
        'title' => 'Fieldgrouptitle'
    );

    /**
     * Counter for total number of added fields in this section
     * @var int
     */
    protected $numberOfFields = 0;

    /**
     * Counter for actual fields to render
     * @var int
     */
    protected $numberOfVisibleFields = 0;

    /**
     * Constructor
     * @param string $id
     * @param $args
     * @param array $areaContext
     * @return \Kontentblocks\Fields\FieldSection
     */
    public function __construct($id, $args, $envVars)
    {

        $this->id = $id;
        $this->args = $this->prepareArgs($args);
        $this->envVars = $envVars;

    }

    /**
     * Add a field definition to the group field collection
     *
     * TODO: Reduce conditional nesting
     * @param string $type | Type of form field
     * @param string $key | Unique key
     * @param array $args | additional parameters, may differ by field type
     * @return self Fluid layout
     * @todo check if field type exists
     */
    public function addField($type, $key, $args)
    {
        if (!$this->fieldExists($key)) {
            $Registry = FieldRegistry::getInstance();
            $field = $Registry->getField($type);
            $field->setKey($key);
            $field->setArgs($args);
            $field->setType($type);
            $this->markByEnvVar($field);

            if (isset($args['arrayKey'])) {
                $this->addArrayField($field, $key, $args);
            } else {
                $this->fields[$key] = $field;
            }
            $this->_increaseVisibleFields();
        }
        return $this;

    }

    /**
     * Handle special array notation
     * @param object $field
     * @param string $key
     * @param array $args
     */
    public function addArrayField($field, $key, $args)
    {
        if (!$this->fieldExists($args['arrayKey'])) {
            $FieldArray = $this->fields[$args['arrayKey']] = new FieldArray($args['arrayKey']);
        } else {

            $FieldArray = $this->fields[$args['arrayKey']];
        }
        $FieldArray->addField($key, $field);

    }

    /**
     * Wrapper method
     * Sets essential properties
     * Calls render() on each field
     * @param string $moduleId
     * @param array $data | stored data for the field
     * TODO: Change moduleId zo baseId for consistency
     * TODO: Check if possible / Refactor to set properties earlier
     */
    public function render($moduleId, $data)
    {
        if (empty($this->fields)) {
            return;
        }

        foreach ($this->fields as $field) {
            // TODO: Keep an eye on it
            if (isset($data[$field->getKey()])) {
                $fielddata = (is_array($data) && !is_null($data[$field->getKey()])) ? $data[$field->getKey()] : $this->getFieldStd($field);
            } else {
                $fielddata = $this->getFieldStd($field);
            }

            $field->setBaseId($moduleId);
            $field->setData($fielddata);


            $field->build();
        }

    }


    private function getFieldStd($field)
    {
        return $field->getArg('std', '');

    }

    /**
     * TODO: DocBlock me!
     * @param array $data
     * @param $oldData
     * @return array
     */
    public function save($data, $oldData)
    {
        $collect = array();
        foreach ($this->fields as $field) {
            $old = (isset($oldData[$field->getKey()])) ? $oldData[$field->getKey()] : NULL;

            if (isset($data[$field->getKey()])) {
                $collect[$field->getKey()] = $field->_save($data[$field->getKey()], $old);
            } else {
                $collect[$field->getKey()] = $field->_save(NULL, $old);
            }
        }
        return $collect;

    }

    /*
     * -----------------------------------------------
     * Getter
     * -----------------------------------------------
     */

    /**
     * Getter to retrieve registered fields
     * @return array
     */
    public function getFields()
    {
        return $this->fields;

    }

    /**
     * TODO: Sanity?
     * @return type
     */
    public function getLabel()
    {
        return $this->args['label'];

    }

    /**
     * ID getter
     * @return string
     */
    public function getID()
    {
        return $this->id;

    }

    /*
     * -----------------------------------------------
     * Helper methods
     * -----------------------------------------------
     */

    /**
     * Test if a key already exists
     * @param string $key
     * @return bool
     */
    public function fieldExists($key)
    {
        return isset($this->fields[$key]);

    }

    public function prepareArgs($args)
    {
        return wp_parse_args($args, self::$defaults);

    }

    /**
     * Set visibility of field based on environment vars given by the module
     * By following a hierachie: PostType -> PageTemplate -> AreaContext
     * @param $field
     * @return mixed
     */
    public function markByEnvVar($field)
    {
        $areaContext = $this->envVars['areaContext'];
        $postType = $this->envVars['postType'];
        $pageTemplate = $this->envVars['pageTemplate'];




        if ($field->getArg('postType') && !in_array($postType, (array)$field->getArg('postType'))) {
            return $field->setDisplay(false);
        }

        if ($field->getArg('pageTemplate') && !in_array($pageTemplate, (array)$field->getArg('pageTemplate'))) {
            return $field->setDisplay(false);
        }

        if (!isset($areaContext) || $areaContext === false || ($field->getArg('areaContext') === false)) {
            return $field->setDisplay(true);
        } else if (in_array($areaContext, $field->getArg('areaContext'))) {
            return $field->setDisplay(true);
        }

        $this->_decreaseVisibleFields();
        return $field->setDisplay(false);

    }

    /**
     * Increase number of visible fields property
     */
    private function _increaseVisibleFields()
    {
        $this->numberOfVisibleFields++;
        $this->numberOfFields++;

    }

    /**
     * Descrease number of visible fields property
     */
    private function _decreaseVisibleFields()
    {
        $this->numberOfVisibleFields--;

    }

    /**
     * Getter Number of visible fields
     * @return int
     */
    public function getNumberOfVisibleFields()
    {
        return $this->numberOfVisibleFields;

    }

}
