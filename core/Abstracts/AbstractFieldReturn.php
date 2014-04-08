<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceFieldReturn;


abstract class AbstractFieldReturn implements InterfaceFieldReturn
{

    public $value;

    public $moduleId;

    public $key;

    public $arrayKey;

    public $index = null;

    protected $inlineEdit = true;

    protected $uid;

    public function __construct($value, $field)
    {
        $this->setValue($value);
        $this->setupFromField($field);
        $this->uid = uniqid('kb');
    }

    /**
     * Getter for value
     * @param null $arraykey
     * @return array
     */
    public function getValue($arraykey = null)
    {

        if (is_array($this->value) && !is_null($arraykey)) {
            if (isset($this->value[$arraykey])) {
                return $this->value[$arraykey];
            }
        }

        return $this->value;

    }

    abstract function getEditableClass();

    /**
     * Make this usable in twig templates without voodoo
     * @return mixed
     */
    public function __toString()
    {
        return $this->value;
    }

    /**
     * Add some classes and attributes dynmaically if inline support is active
     * and the user is logged in
     */
    public function handleLoggedInUsers()
    {
        if (is_user_logged_in() && $this->inlineEdit) {
            $editableClass = $this->getEditableClass();
            $this->addClass($editableClass);
            $this->addAttr('data-module', $this->moduleId);
            $this->addAttr('data-key', $this->key);
            $this->addAttr('data-arrayKey', $this->arrayKey);
            if (!is_null($this->index)) {
                $this->addAttr('data-index', $this->index);
            }
            $this->addAttr('data-uid', $this->uid);
        }
    }

    /**
     * Set inline edit support on or off
     * @param $bool
     * @return $this
     */
    public function inlineEdit($bool)
    {
        $in = filter_var($bool, FILTER_VALIDATE_BOOLEAN);
        $this->inlineEdit = $in;
        return $this;
    }

    public function setValue($value)
    {

        $this->value = $value;
    }

    private function setupFromField($field)
    {
        if (is_object($field)) {
            $this->moduleId = $field->parentModuleId;
            $this->key = $field->getKey();
            $this->arrayKey = $field->getArg('arrayKey');
        } else if (is_array($field)) {
            $this->moduleId = $field['instance_id'];
            $this->key = $field['key'];
            $this->arrayKey = $field['arrayKey'];
            $this->index = $field['index'];
        }


    }

}
