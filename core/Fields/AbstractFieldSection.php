<?php

namespace Kontentblocks\Fields;

use Exception;
use Kontentblocks\Common\Exportable;
use Kontentblocks\Kontentblocks;

/**
 * Class AbstractFieldSection
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldSection implements Exportable
{

    /**
     * Unique identifier
     * @var string id unique identifier
     */
    public $id;

    /**
     * Array of registered fields for this section
     * @var array
     */
    protected $fields;

    /**
     * Can be a module or a panel
     * @var object
     */
    protected $module;

    /**
     * Preset defaults
     * @var array
     */
    public static $defaults = array(
        'label' => 'Fieldgroup',
        'title' => 'Fieldgrouptitle'
    );

    /**
     * Baseid, as passed to fields
     * @var string
     */
    public $baseId;

    private $priorityCount = 10;

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


    abstract public function markVisibility( Field $Field );


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
    public function addField( $type, $key, $args )
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
            $field = $registry->getField( $type, $this->baseId, $subkey, $key );
            if (!$field) {
                throw new Exception( "Field of type: $type does not exist" );
            } else {
                $field->setArgs( $args );
                $field->section = $this;
                // conditional check of field visibility
                $this->markVisibility( $field );

                // Fields with same arrayKey gets grouped into own collection
                if (isset( $args['arrayKey'] )) {
                    $this->addArrayField( $field, $key, $args );
                } else {
                    $this->fields[$key] = $field;
                }
                $this->_increaseVisibleFields();
                $this->orderFields();
            }
        }
        return $this;

    }


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

    }

    /**
     * Wrapper method
     * Sets essential properties
     * Calls render() on each field
     *
     * @param array $data | stored data for the field
     * TODO: Change moduleId zo baseId for consistency
     * TODO: Check if possible / Refactor to set properties earlier
     */
    public function render( $data )
    {
        if (empty( $this->fields )) {
            return;
        }

        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->fields as $field) {
            // TODO: Keep an eye on it


            if (!is_a( $field, '\Kontentblocks\Fields\FieldSubGroup' )) {
                if (isset( $data[$field->getKey()] )) {
                    $fielddata = ( is_array( $data ) && !is_null( $data[$field->getKey()] ) ) ? $data[$field->getKey(
                    )] : $this->getFieldStd( $field );
                } else {
                    $fielddata = $this->getFieldStd( $field );
                }
            } else {
                $fielddata = ( isset( $data[$field->getKey()] ) ) ? $data[$field->getKey()] : array();
            }
            $field->setValue( $fielddata );

            // Build field form
            $field->build();
        }

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

    /*
 * -----------------------------------------------
 * Getter
 * -----------------------------------------------
 */

    /**
     * Getter to retrieve all registered fields
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
     *
     * @param string $key
     *
     * @return bool
     */
    public function fieldExists( $key )
    {
        return isset( $this->fields[$key] );
    }

    public function prepareArgs( $args )
    {
        return wp_parse_args( $args, self::$defaults );

    }

    /**
     * Increase number of visible fields property
     */
    protected function _increaseVisibleFields()
    {
        $this->numberOfVisibleFields ++;
        $this->numberOfFields ++;

    }

    /**
     * Descrease number of visible fields property
     */
    protected function _decreaseVisibleFields()
    {
        $this->numberOfVisibleFields --;

    }

    /**
     * Getter Number of visible fields
     * @return int
     */
    public function getNumberOfVisibleFields()
    {
        return $this->numberOfVisibleFields;

    }

    private function orderFields()
    {
        $code = "return strnatcmp(\$a->getArg('priority'), \$b->getArg('priority'));";
        uasort( $this->fields, create_function( '$a,$b', $code ) );

    }

    public function export( &$collection )
    {
        foreach ($this->fields as $Field) {
            $Field->export( $collection );
        }
    }


} 