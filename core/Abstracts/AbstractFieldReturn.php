<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Interfaces\InterfaceFieldReturn;

abstract class AbstractFieldReturn implements InterfaceFieldReturn
{

    public $value;

    public function __construct($value)
    {
        $this->value = $value;

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
            if (is_object($this->field)) {
                $this->addClass($editableClass);
                $this->addAttr('data-module', $this->field->parentModuleId);
                $this->addAttr('data-key', $this->field->getKey());
                $this->addAttr('data-arrayKey', $this->field->getArg('arrayKey'));
            } else if (is_array($this->field)) {
                $this->addClass($editableClass);
                $this->addAttr('data-module', $this->field['instance_id']);
                $this->addAttr('data-key', $this->field['key']);
                $this->addAttr('data-arrayKey', $this->field['arrayKey']);
                $this->addAttr('data-index', $this->field['index']);
            }
        }
    }

    /**
     * Different classes for Headlines and the rest
     * @return string
     */
    private function getEditableClass()
    {
        $titles = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
        $text = array('div', 'p', 'span', 'article', 'section');

        if (in_array($this->el, $titles)) {
            return 'editable-title';
        }

        if (in_array($this->el, $text)) {
            return 'editable';
        }

        return 'not-editable';
    }


}
