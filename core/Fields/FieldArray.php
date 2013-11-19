<?php

namespace Kontentblocks\Fields;

class FieldArray
{

    protected $key;
    protected $fields;
    protected $baseId;
    protected $returnObj;

    public function __construct( $key )
    {
        $this->key = $key;
        return $this;

    }

    public function addField( $key, $fieldobject )
    {
        $this->fields[ $key ] = $fieldobject;
        return $this;

    }

    public function setup( $instanceData, $baseId )
    {
        foreach ( $this->fields as $field ) {
            $fielddata = (!empty( $instanceData[ $field->getKey() ] )) ? $instanceData[ $field->getKey() ] : '';
            $field->setup( $fielddata, $baseId );
        }

    }



    public function save( $data )
    {
        $collect = array();
        foreach ( $this->fields as $field ) {
            $collect[ $field->getKey() ] = $field->save( $data[ $field->getKey() ] );
        }
        return $collect;

    }

    public function getKey()
    {
        return $this->key;

    }

    public function getReturnObj()
    {
        $this->returnObj = new \Kontentblocks\Fields\Returnobjects\ArrayFieldReturn( $this->fields );
        return $this->returnObj;

    }

    /**
     * Passes the setBaseId() call through to the actual field method
     * Modifies the baseId to setup the array nature
     * Called by a section handler
     * Part of the backend form rendering process
     * @param string $baseId
     */
    public function setBaseId( $baseId )
    {
        foreach ( $this->fields as $field ) {
            $field->setBaseId( $baseId, $this->key );
        }

    }

    /**
     * Pass through of section handler setData() on field call
     * Ensures each child field receives its corresponding data
     * Part of the backend form rendering process
     * @param array $data 
     */
    public function setData( $data )
    {
        foreach ( $this->fields as $field ) {
            $fielddata = (!empty( $data[ $field->getKey() ] )) ? $data[ $field->getKey() ] : '';
            $field->setData( $fielddata );
        }

    }

    /**
     * Pass through build() method call to child fields
     * @return void 
     */
    public function build()
    {
        foreach ( $this->fields as $field ) {
            $field->build();
        }

    }

}
