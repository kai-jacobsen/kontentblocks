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
 * Gets instantiated by Kontentblocks\Fields\Refield when
 * addSection() is called 
 * 
 * @see Kontentblocks\Fields\Refield::addSection()
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
     * Arra of registered fields for this section
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
     * Constructor
     * @param string $id
     * @return \Kontentblocks\Fields\FieldSection
     */
    public function __construct( $id )
    {
        $this->id = $id;
        return $this;

    }

    /**
     * Add a field definition to the group field collection
     * 
     * TODO: Reduce conditional nesting
     * @param string $type | Type of form field
     * @param string $key | Unique key
     * @param array $args | additional parameters, may differ by field type
     * @return self Fluid layout
     */
    public function addField( $type, $key, $args )
    {
        if ( !$this->fieldExists( $key ) ) {
            $Factory = FieldRegistry::getInstance();
            $field   = $Factory->getField( $type );
            $field->setKey( $key );
            $field->setArgs( $args );
            $field->setType( $type );

            if ( isset( $args[ 'arrayKey' ] ) ) {
                if ( !$this->fieldExists( $args[ 'arrayKey' ] ) ) {
                    $FieldArray                          = $this->fields[ $args[ 'arrayKey' ] ] = new FieldArray( $args[ 'arrayKey' ] );
                }
                else {
                    $FieldArray = $this->fields[ $args[ 'arrayKey' ] ];
                }
                $FieldArray->addField( $key, $field );
            }
            else {
                $this->fields[ $key ] = $field;
            }
        }
        return $this;

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
    public function render( $moduleId, $data )
    {
        foreach ( $this->fields as $field ) {
            $fielddata = (!empty( $data[ $field->getKey() ] )) ? $data[ $field->getKey() ] : '';
            $field->setBaseId( $moduleId );
            $field->setData( $fielddata );
            $field->build();
        }

    }

    /**
     * TODO: DocBlock me!
     * @param array $data
     * @return array
     */
    public function save( $data )
    {
        $collect = array();
        foreach ( $this->fields as $field ) {
            $collect[ $field->getKey() ] = $field->save( $data[ $field->getKey() ] );
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
        return self::$defaults[ 'label' ];

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
    public function fieldExists( $key )
    {
        return isset( $this->fields[ $key ] );

    }

}
