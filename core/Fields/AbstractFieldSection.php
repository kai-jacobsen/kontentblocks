<?php

namespace Kontentblocks\Fields;

use Exception;

/**
 * Class AbstractFieldSection
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldSection
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
    protected $Fields;

    /**
     * Can be a module or a panel
     * @var object
     */
    protected $Emitter;

    /**
     * Preset defaults
     * @var array
     */
    public static $defaults = array(
        'label' => 'Fieldgroup',
        'title' => 'Fieldgrouptitle'
    );

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
        if (!$this->fieldExists( $key )) {
            $Registry = FieldRegistry::getInstance();
            $Field    = $Registry->getField( $type );

            //check for special key syntax
            if (preg_match( "/^(.*?)::/i", $key, $out )) {
                if (is_array( $out ) && count( $out ) == 2) {
                    $key = str_replace( $out[0], '', $key );

                    if (isset( $args['arrayKey'] ) && $args['arrayKey'] !== $out[1]) {
                        throw new Exception( 'ArrayKey mismatch' );
                    }

                    $args['arrayKey'] = $out[1];
                }
            }

            $Field->setKey( $key );
            $Field->setArgs( $args );
            $Field->setType( $type );

            // conditional check of field visibility
            $this->markVisibility( $Field );

            // Fields with same arrayKey gets grouped into own collection
            if (isset( $args['arrayKey'] )) {
                $this->addArrayField( $Field, $key, $args );
            } else {
                $this->Fields[$key] = $Field;
            }
            $this->_increaseVisibleFields();
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
            $FieldArray = $this->Fields[$args['arrayKey']] = new FieldArray( $args['arrayKey'] );
        } else {
            $FieldArray = $this->Fields[$args['arrayKey']];
        }
        $FieldArray->addField( $key, $field );

    }

    /**
     * Wrapper method
     * Sets essential properties
     * Calls render() on each field
     *
     * @param string $moduleId
     * @param array $data | stored data for the field
     * TODO: Change moduleId zo baseId for consistency
     * TODO: Check if possible / Refactor to set properties earlier
     */
    public function render( $moduleId, $data )
    {
        if (empty( $this->Fields )) {
            return;
        }

        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->Fields as $field) {
            // TODO: Keep an eye on it

            if (isset( $data[$field->getKey()] )) {
                $fielddata = ( is_array( $data ) && !is_null( $data[$field->getKey()] ) ) ? $data[$field->getKey(
                )] : $this->getFieldStd( $field );
            } else {
                $fielddata = $this->getFieldStd( $field );
            }
            $field->setBaseId( $moduleId );
            $field->setData( $fielddata );

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

        /** @var \Kontentblocks\Fields\Field $field */
        foreach ($this->Fields as $field) {
            $field->setModule( $this->Emitter );
            $old = ( isset( $oldData[$field->getKey()] ) ) ? $oldData[$field->getKey()] : null;
            if (isset( $data[$field->getKey()] )) {
                $collect[$field->getKey()] = $field->_save( $data[$field->getKey()], $old );
            } else {

                if (is_a( $field, '\Kontentblocks\Fields\FieldArray' ) || $field->getSetting( 'forceSave' )) {
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
        return $this->Fields;

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
        return isset( $this->Fields[$key] );
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
} 