<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\FieldRegistry;

class FieldSingle
{

    public $id;
    protected $field;

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
        $Factory     = FieldRegistry::getInstance();
        $this->field = $Factory->getField( $type );
        $this->field->setKey( $key );
        $this->field->setArgs( $args );
        return $this;

    }

    public function render()
    {
        
    }

    public function save( $data )
    {
            d($data);
            return array( $this->field->getKey() => $this->field->save( $data[ $this->field->getKey() ] ));
        

    }

}
