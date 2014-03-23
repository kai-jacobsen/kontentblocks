<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Abstracts\AbstractFieldReturn;

class Element extends AbstractFieldReturn
{

    /**
     * The wrapper element name to us
     * @var string
     * @since 1.0.0
     */
    protected $el;

    /**
     * Set of css classes to add to the el
     * @var array
     * @since 1.0.0
     */
    protected $classes = array();

    /**
     * Additional attribures
     * @var array
     * @since 1.0.0
     */
    protected $attributes = array();

    /**
     * Settings to activate/deactivate inline editing
     * @var bool
     * @since 1.0.0
     */
    protected $inlineEdit = true;

    /**
     * The field object if this comes from ReField
     * The array if set manually
     * @var object | array
     * @since 1.0.0
     */
    protected $field;


    /**
     * Class constructore
     * @param $value
     * @param $field
     * @since 1.0.0
     */
    public function __construct($value, $field)
    {
        $this->field = $field;
        parent::__construct($value);

    }

    /**
     * Add a (css) class to the stack of classes
     * @param string $class
     * @return $this
     * @since 1.0.0
     */
    public function addClass($class)
    {
        if (is_array($class)) {
            $this->classes = array_merge($this->classes, $class);
        } else {
            $this->classes = array_merge(explode(' ', $this->_cleanSpaces($class)), $this->classes);
        }
        return $this;

    }

    /**
     * Add an attribute to the stack of attributes
     * @param string $attr
     * @param string $value
     * @return $this
     * @since 1.0.0
     */
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

    /**
     * Setter for el
     * @param string $el
     * @return $this
     * @since 1.0.0
     */
    public function el($el)
    {
        $this->el = $el;
        return $this;

    }

    /**
     * html output method
     * @return string
     * @since 1.0.0
     */
    public function html()
    {

        $this->handleLoggedInUsers();


        $format = '<%1$s id="%4$s" %3$s>%2$s</%1$s>';

        if (!in_array($this->el, array('h1', 'h2', 'h3', 'h4', 'h5', 'h6'))){
            $filtered = apply_filters('the_content', $this->value);
        } else {
            $filtered = $this->value;
        }

        if (is_user_logged_in()){
            return sprintf($format, $this->el, $filtered, $this->_renderAttributes(), uniqid('kb'));
        } else {
            $format = '<%1$s %3$s>%2$s</%1$s>';
            return sprintf($format, $this->el, $filtered, $this->_renderAttributes());
        }

    }

    /**
     * Helper to remove spaces
     * @param $string
     * @return string|void
     * @since 1.0.0
     */
    private function _cleanSpaces($string)
    {
        return esc_attr(preg_replace('/\s{2,}/', ' ', $string));

    }

    /**
     * Render classes and extra attributes
     * @return string
     * @since 1.0.0
     */
    private function _renderAttributes()
    {
        $return = "class='{$this->_classList()}' ";
        $return .= $this->_attributesList();
        return trim($return);

    }

    /**
     * From array to string
     * @return string
     * @since 1.0.0
     */
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


    public function specialchars($matches)
    {
        return '<' . $matches[1] . $matches[2] . '>' . htmlspecialchars(substr(str_replace('<' . $matches[1] . $matches[2] . '>', '', $matches[0]), 0, -(strlen($matches[1]) + 3))) . '</' . $matches[1] . '>';
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

}
