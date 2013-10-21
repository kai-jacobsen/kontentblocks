<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\FieldRegistry;

class Fieldgroup
{

    public $id;
    protected $fields;

    public function __construct( $id )
    {
        $this->id = $id;

        return $this;

    }

    /**
     * Add a field definition to the group field collection
     * @param string $type | Type of form field
     * @param string $key | Unique key
     * @param array $args | additional parameters, may differ by field type
     */
    public function addField( $type, $key, $args )
    {
        if ( !$this->fieldExists( $key ) ) {
            $Factory     = FieldRegistry::getInstance();
            $field = $Factory->getField( $type );
            $field->setKey( $key );
            $field->setArgs( $args );
            $field->setType($type);
            $this->fields[$key] = $field;
        }
        return $this;

    }

    public function render( $moduleId, $data )
    {
        foreach ( $this->fields as $field ) {
            $field->setBaseId($moduleId);
            $field->setData($data);
            $field->build();
                
        }
    }

    /**
     * Test if a key already exists
     * @param string $key
     * @return bool
     */
    public function fieldExists( $key )
    {
        return isset( $this->fields[ $key ] );

    }
    
    
    public function save( $data)
    {
        $collect = array();
        foreach ($this->fields as $field){
            $collect[$field->getKey()] = $field->save($data[$field->getKey()]);
        }
        return $collect;
        exit;
    }

}
