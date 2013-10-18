<?php

namespace Kontentblocks\Fields;
use Kontentblocks\Fields\FieldDirectory;

class FieldSingle
{
    public $id;
    protected $fields;

    public function __construct($id)
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
        $Factory = FieldDirectory::getInstance();
        $this->field = $Factory->getField($type);
        return $this;

    }

    public function render()
    {
       d($this);

    }

}
