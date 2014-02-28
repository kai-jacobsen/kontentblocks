<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Abstracts\AbstractFieldReturn;

class Element extends AbstractFieldReturn
{

    protected $el;
    protected $classes = array();
    protected $attributes = array();
    protected $inlineEdit = true;
    protected $field;

    public function __construct($value, $field)
    {
        $this->field = $field;
        parent::__construct($value);
    }

    public function addClass($class)
    {

        if (is_array($class)) {
            $this->classes = array_merge($this->classes, $class);
        } else {
            $this->classes = array_merge(explode(' ', $this->_cleanSpaces($class)), $this->classes);
        }
        return $this;

    }

    public function addAttr($attr, $value = '')
    {
        if (is_array($attr)) {
            $this->attributes = array_merge($this->attributes, $attr);
        } else {
            if ($value !== false){
                $this->attributes[$attr] = $value;
            }
        }
        return $this;

    }

    public function el($el)
    {
        $this->el = $el;
        return $this;

    }

    public function html()
    {

        if (is_user_logged_in() && $this->inlineEdit) {
            $editableClass = $this->getEditableClass();
            if (is_object($this->field)) {
                $this->addClass($editableClass);
                $this->addAttr('data-module', $this->field->parentModule);
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


        $format = '<%1$s id="%4$s" %3$s>%2$s</%1$s>';

        if (!in_array($this->el, array('h1', 'h2', 'h3', 'h4', 'h5', 'h6'))){
            $filtered = apply_filters('the_content', $this->value);
        } else {
            $filtered = $this->value;
        }
        $codeblocks = $this->fixcodeblocks($filtered);

        if (is_user_logged_in()){
            return sprintf($format, $this->el, $codeblocks, $this->_renderAttributes(), uniqid('kb'));
        } else {
            $format = '<%1$s %3$s>%2$s</%1$s>';
            return sprintf($format, $this->el, $codeblocks, $this->_renderAttributes());
        }

    }

    private function _cleanSpaces($string)
    {
        return esc_attr(preg_replace('/\s{2,}/', ' ', $string));

    }

    private function _renderAttributes()
    {
        $return = "class='{$this->_classList()}' ";
        $return .= $this->_attributesList();
        return trim($return);

    }

    private function _classList()
    {
        return trim(implode(' ', $this->classes));

    }

    private function _attributesList()
    {
        $returnstr = '';
        foreach ($this->attributes as $attr => $value) {
            $returnstr .= "{$attr}='{$value}' ";
        }
        return trim($returnstr);

    }

    public function fixcodeblocks($string)
    {
        return preg_replace_callback('#<(code|pre)([^>]*)>(((?!</?\1).)*|(?R))*</\1>#si', array($this, 'specialchars'), $string);
    }

    public function specialchars($matches)
    {
        return '<' . $matches[1] . $matches[2] . '>' . htmlspecialchars(substr(str_replace('<' . $matches[1] . $matches[2] . '>', '', $matches[0]), 0, -(strlen($matches[1]) + 3))) . '</' . $matches[1] . '>';
    }


    public function inlineEdit($bool)
    {
        $in = filter_var($bool, FILTER_VALIDATE_BOOLEAN);
        $this->inlineEdit = $in;
        return $this;
    }

    private function getEditableClass()
    {
        $titles = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
        $text = array('div', 'p', 'span');

        if (in_array($this->el,$titles)){
            return 'editable-title';
        }

        if (in_array($this->el,$text)){
            return 'editable';
        }

        return 'not-editable';
    }

}
