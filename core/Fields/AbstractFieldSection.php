<?php

namespace Kontentblocks\Fields;

use Exception;
use Kontentblocks\Common\Exportable;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class AbstractFieldSection
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldSection implements Exportable
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
     * Unique identifier
     * @var string id unique identifier
     */
    public $sectionId;
    /**
     * Baseid, as passed to fields
     * @var string
     */
    public $baseId;
    /**
     * Array of registered fields for this section
     * @var array
     */

    public $objectId = 0;

    protected $fields;
    /**
     * Can be a module or a panel
     * @var EntityInterface
     */
    protected $entity;
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
     * Add a field definition to the group field collection
     *
     * @param string $type | Type of form field
     * @param string $key | Unique key
     * @param array $args | additional parameters, may differ by field type
     *
     * @throws \Exception
     * @return self Fluid layout
     */
    public function addField( $type, $key, $args = array() )
    {
        $subkey = null;

        if (!$this->fieldExists( $key )) {

            //check for special key syntax
            if (preg_match( "/^(.*?)::/i", $key, $out )) {
                if (is_array( $out ) && count( $out ) == 2) {
                    $key = str_replace( $out[0], '', $key );

                    if (isset( $args['arrayKey'] ) && $args['arrayKey'] !== $out[1]) {
                        throw new Exception(
                            'ArrayKey mismatch. Field key has :: syntax and arrayKey arg is set, but differs'
                        );
                    }
                    $args['arrayKey'] = $subkey = $out[1];
                }
            }


            if (!isset( $args['priority'] )) {
                $args['priority'] = $this->priorityCount;
                $this->priorityCount += 5;
            }

            /** @var \Kontentblocks\Fields\FieldRegistry $registry */
            $registry = Kontentblocks::getService( 'registry.fields' );
            $field = $registry->getField( $type, $this->baseId, $subkey, $key, $args );
            if (!$field) {
                throw new Exception( "Field of type: $type does not exist" );
            } else {
                $field->section = $this;
                $field->objectId = $this->objectId;
                // conditional check of field visibility
                $this->markVisibility( $field );

                // Fields with same arrayKey gets grouped into own collection
                if (isset( $args['arrayKey'] )) {
                    $newField = $this->addArrayField( $field, $key, $args );
                } else {
                    $this->fields[$key] = $newField = $field;
                }


                $data = $this->getEntityModel();
                if (!is_a( $newField, '\Kontentblocks\Fields\FieldSubGroup' )) {
                    if (isset( $data[$newField->getKey()] )) {
                        $fielddata = ( is_object( $data ) && !is_null(
                                $data[$newField->getKey()]
                            ) ) ? $data[$newField->getKey()] : $this->getFieldStd( $newField );
                    } else {
                        $fielddata = $this->getFieldStd( $newField );
                    }
                } else {
                    $fielddata = ( isset( $data[$newField->getKey()] ) ) ? $data[$newField->getKey()] : array();
                }

                $newField->setData( $fielddata );
                $this->_increaseVisibleFields();
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
    public function fieldExists( $key )
    {
        return isset( $this->fields[$key] );
    }

    abstract public function markVisibility( Field $Field );

    /**
     * Handle special array notation
     *
     * @param object $field
     * @param string $key
     * @param array $args
     */
    public function addArrayField( $field, $key, $args )
    {
        if (!$this->fieldExists( $args['arrayKey'] )) {
            $fieldArray = $this->fields[$args['arrayKey']] = new FieldSubGroup( $args['arrayKey'] );
        } else {
            $fieldArray = $this->fields[$args['arrayKey']];
        }
        $fieldArray->addField( $key, $field );
        return $fieldArray;
    }

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
    private function getFieldStd( $field )
    {
        return $field->getArg( 'std', '' );

    }

    /*
 * -----------------------------------------------
 * Getter
 * -----------------------------------------------
 */

    /**
     * Increase number of visible fields property
     */
    protected function _increaseVisibleFields()
    {
        $this->numberOfVisibleFields ++;
        $this->numberOfFields ++;

    }

    private function orderFields()
    {
        $code = "return strnatcmp(\$a->getArg('priority'), \$b->getArg('priority'));";
        uasort( $this->fields, create_function( '$a,$b', $code ) );

    }

    /**
     * Wrapper method
     * Sets essential properties
     * Calls render() on each field
     *
     * TODO: Check if possible / Refactor to set properties earlier
     */
    public function render()
    {
        if (empty( $this->fields )) {
            return;
        }

        $flatten = $this->flattenFields();

        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($flatten as $field) {
            $field->build();
        }
    }


    /*
     * -----------------------------------------------
     * Helper methods
     * -----------------------------------------------
     */

    /**
     * Calls save on fields and collects the results in one array
     *
     * @param array $data new data
     * @param array $oldData previous data
     *
     * @return array
     */
    public function save( $data, $oldData )
    {
        $collect = array();

        if (!is_array( $this->fields )) {
            return $oldData;
        }
        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fields as $field) {
            $old = ( isset( $oldData[$field->getKey()] ) ) ? $oldData[$field->getKey()] : null;
            if (isset( $data[$field->getKey()] )) {
                $collect[$field->getKey()] = $field->_save( $data[$field->getKey()], $old );
            } else {
                if (is_a( $field, '\Kontentblocks\Fields\FieldSubGroup' ) || $field->getSetting( 'forceSave' )) {
                    // calls save on field if key is not present
                    $collect[$field->getKey()] = $field->_save( null, $old );
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
     * @return type
     */
    public function getLabel()
    {
        return $this->args['label'];

    }

    /**
     * @return type
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

    public function prepareArgs( $args )
    {
        return Utilities::arrayMergeRecursive($args, self::$defaults);

    }

    /**
     * Getter Number of visible fields
     * @return int
     */
    public function getNumberOfVisibleFields()
    {
        return $this->numberOfVisibleFields;

    }

    public function export( &$collection )
    {
        foreach ($this->fields as $Field) {
            $Field->export( $collection );
        }
    }

    public function getEntity()
    {
        return $this->entity;
    }

    /**
     * Descrease number of visible fields property
     */
    protected function _decreaseVisibleFields()
    {
        $this->numberOfVisibleFields --;

    }

    public function flattenFields()
    {
        $flatten = array();

        if (empty($this->fields)){
            return $flatten;
        }

        foreach ($this->fields as $field) {
            if (is_a( $field, '\Kontentblocks\Fields\FieldSubGroup' )) {
                foreach ($field->getFields() as $field) {
                    $flatten[] = $field;
                }
            } else {
                $flatten[] = $field;
            }
        }
        return $flatten;
    }


} 