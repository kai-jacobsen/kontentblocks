<?php

namespace Kontentblocks\Fields;


/**
 * Class FieldTabGroup
 * @package Kontentblocks\Fields
 */
class FieldTabGroup
{

    /**
     * @var string
     */
    protected $tabid;

    /**
     * @var string
     */
    protected $label;

    /**
     * @var array
     */
    public $fields;


    /**
     * FieldTabGroup constructor.
     * @param $tabid
     * @param $label
     */
    public function __construct($label, $tabid = null)
    {
        if ($tabid) {
            $this->tabid = $tabid;
        } else {
            $this->tabid = sanitize_key($label);
        }
        $this->label = $label;
    }


    /**
     * @param Field $field
     */
    public function addField(Field $field)
    {
        $this->fields[] = $field;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->tabid;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @return bool
     */
    public function hasVisibleFields()
    {
        $fields = array_filter($this->fields,function($field){
            /** @var Field $field */
            return $field->isVisible();
        });
        return !empty($fields);
    }

}
