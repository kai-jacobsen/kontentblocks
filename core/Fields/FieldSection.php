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
 * addSection() is called
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
     * @return \Kontentblocks\Fields\FieldSection
     */
    public function __construct( $id, $args, $areaContext = null )
    {

        $this->id          = $id;
        $this->args        = $this->prepareArgs( $args );
        $this->areaContext = $areaContext;

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
    public function addField( $type, $key, $args )
    {


        if ( !$this->fieldExists( $key ) ) {
            $Registry = FieldRegistry::getInstance();
            $field    = $Registry->getField( $type );
            $field->setKey( $key );
            $field->setArgs( $args );
            $field->setType( $type );

            $this->markByAreaContext( $field );

            if ( isset( $args[ 'arrayKey' ] ) ) {
                $this->addArrayField( $field, $key, $args );
            }
            else {
                $this->fields[ $key ] = $field;
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
    public function addArrayField( $field, $key, $args )
    {
        if ( !$this->fieldExists( $args[ 'arrayKey' ] ) ) {
            $FieldArray                          = $this->fields[ $args[ 'arrayKey' ] ] = new FieldArray( $args[ 'arrayKey' ] );
        }
        else {

            $FieldArray = $this->fields[ $args[ 'arrayKey' ] ];
        }
        $FieldArray->addField( $key, $field );

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
        if ( empty( $this->fields ) ) {
            return;
        }

        foreach ( $this->fields as $field ) {
            // TODO: Keep an eye on it
            if ( isset( $data[ $field->getKey() ] ) ) {
                $fielddata = (is_array( $data ) && !is_null( $data[ $field->getKey() ] )) ? $data[ $field->getKey() ] : '';
            }
            else {
                $fielddata = '';
            }

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
    public function save( $data, $oldData )
    {
        $collect = array();
        foreach ( $this->fields as $field ) {
            $old = (isset( $oldData[ $field->getKey() ] )) ? $oldData[ $field->getKey() ] : NULL;

            if ( isset( $data[ $field->getKey() ] ) ) {
                $collect[ $field->getKey() ] = $field->_save( $data[ $field->getKey() ], $old );
            }
            else {
                $collect[ $field->getKey() ] = $field->_save( NULL, $old );
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
        return $this->args[ 'label' ];

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

    public function prepareArgs( $args )
    {
        return wp_parse_args( $args, self::$defaults );

    }

    public function markByAreaContext( $field )
    {
        if ( !isset( $this->areaContext ) || $this->areaContext === false || ($field->getArg( 'areaContext' ) === false) ) {
            return $field->setDisplay( true );
        }
        else if ( in_array( $this->areaContext, $field->getArg( 'areaContext' ) ) ) {
            return $field->setDisplay( true );
        }
        else {
            $this->_decreaseVisibleFields();
            return $field->setDisplay( false );
        }

    }

    private function _increaseVisibleFields()
    {
        $this->numberOfVisibleFields++;
        $this->numberOfFields++;

    }

    private function _decreaseVisibleFields()
    {
        $this->numberOfVisibleFields--;

    }

    public function getNumberOfVisibleFields()
    {
        return $this->numberOfVisibleFields;

    }

}
