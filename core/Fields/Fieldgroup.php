<?php

namespace Kontentblocks\Fields;

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
            $this->fields[ $key ] = array(
                'type' => $type,
                'key' => $key,
                'args' => $args
            );
        }
        return $this;

    }

    public function render()
    {
        foreach ($this->fields as $field){
            print_r($field);
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

}
