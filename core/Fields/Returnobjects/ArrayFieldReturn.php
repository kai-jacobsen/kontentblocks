<?php

namespace Kontentblocks\Fields\Returnobjects;

/**
 * @todo: finish
 */
class ArrayFieldReturn
{

    protected $fields;
    public $value;


    public function __construct( $fields)
    {
        $this->fields = $fields;
        $this->setupFields();
    }

    public function setupFields()
    {
        $collect = array();

        foreach ($this->fields as $field){
            $fieldkey = $field->getKey();
            $this->$fieldkey = $field->getUserValue();
            $collect[$field->getKey()] = $field->getUserValue();
        }
        $this->value = $collect;
    }

    public function get($key){
        return $this->$key;
    }

}
