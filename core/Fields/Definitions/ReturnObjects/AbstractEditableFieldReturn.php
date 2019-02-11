<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use JsonSerializable;
use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;


/**
 * Class AbstractEditableFieldReturn
 * @package Kontentblocks\Fields\Returnobjects
 */
abstract class AbstractEditableFieldReturn implements InterfaceFieldReturn, InterfaceEditableFieldReturn
{

    /**
     * @var mixed
     */
    public $value;

    /**
     * @var string
     */
    public $moduleId;

    /**
     * @var Field
     */
    public $field;

    /**
     * @var string
     */
    public $key;

    /**
     * @var string
     */
    public $arrayKey;

    /**
     * @var mixed
     */
    public $index;
    /**
     * @var string
     */
    public $helptext = 'Click to edit content';

    public $salt;
    /**
     * @var string
     */
    public $uniqueId;

    public $currentUID;
    /**
     * Set of css classes to add to the el
     * @var array
     * @since 0.1.0
     */
    protected $classes = array();
    /**
     * Additional attribures
     * @var array
     * @since 0.1.0
     */
    protected $attributes = array();
    /**
     * @var bool
     */
    protected $inlineEdit = true;

    /*
     *
     */
    protected $callCount = 0;

    /**
     * @var array
     */
    protected $linkedFields = array();

    /**
     * @param $value
     * @param $field
     * @param $salt
     */
    public function __construct( $value, Field $field, $salt = null )
    {

        $this->salt = ( !is_null( $salt ) ) ? $salt : '';
        $this->setValue( $value );
        $this->setupFromField( $field );
        $this->uniqueId = $field->createUID();
        $this->prepare();
        $this->instance();
    }

    /**
     * @param $field
     */
    private function setupFromField( $field )
    {

        if (is_object( $field )) {
            $this->moduleId = $field->getFieldId();
            $this->key = $field->getKey();
            $this->arrayKey = $field->getArg( 'arrayKey' );
            $this->index = $field->getArg( 'index' );
            $this->field = $field;
        }

    }

    protected abstract function prepare();

    public function instance()
    {
        $this->increaseCallCount();
    }

    private function increaseCallCount()
    {

        $this->callCount ++;
        $this->linkedFields[$this->createUniqueId()] = null;
    }

    protected function createUniqueId()
    {
        $base = $this->uniqueId . (string) $this->callCount . $this->salt;
        $uid = 'kbf-' . hash( 'crc32', $base );
        return $this->currentUID = $uid;

    }

    /**
     * Getter for value
     *
     * @param null $arraykey
     *
     * @return array
     */
    public function getValue( $arraykey = null )
    {
        if (is_array( $this->value ) && !is_null( $arraykey )) {
            if (isset( $this->value[$arraykey] )) {
                return $this->value[$arraykey];
            }
        }

        return $this->value;

    }

    public function setValue( $value )
    {
        $this->value = $value;
    }

    /**
     * Add a (css) class to the stack of classes
     *
     * @param string $class
     *
     * @return $this
     * @since 0.1.0
     */
    public function addClass( $class )
    {
        if (is_array( $class )) {
            $this->classes = array_merge( $this->classes, $class );
        } else {
            $this->classes = array_merge( explode( ' ', $this->_cleanSpaces( $class ) ), $this->classes );
        }

        return $this;

    }

    /**
     * Helper to remove spaces
     *
     * @param $string
     *
     * @return string|void
     * @since 0.1.0
     */
    private function _cleanSpaces( $string )
    {
        return esc_attr( preg_replace( '/\s{2,}/', ' ', $string ) );

    }

    /**
     * Remove a (css) class from the output of html() and background()
     * chainable
     *
     * @param string $class
     *
     * @return $this
     */
    public function removeClass( $class )
    {
        $key = array_search( $class, $this->classes );
        if ($key) {
            unset( $this->classes[$key] );
        }

        return $this;
    }

    abstract function getEditableClass();

    abstract function html();

    /**
     * Add some classes and attributes dynmaically if inline support is active
     * and the user is logged in
     */
    public function handleLoggedInUsers()
    {
        if (is_user_logged_in() && $this->inlineEdit && current_user_can( 'edit_kontentblocks' )) {
            $this->addAttr( 'data-kbfuid', $this->createUniqueId() );
        }
    }

    /**
     * Add an attribute to the stack of attributes
     *
     * @param string $attr
     * @param string $value
     *
     * @return $this
     * @since 0.1.0
     */
    public function addAttr( $attr, $value = '' )
    {
        if (is_array( $attr )) {
            $this->attributes = array_merge( $this->attributes, $attr );
        } else {
            if ($value !== false) {
                $this->attributes[$attr] = $value;
            }
        }

        return $this;

    }

    public function getUniqueAttr()
    {
        $this->toJSON();
        return "data-kbfuid={$this->currentUID}";
    }

    public function reuse()
    {
        $this->instance();
    }

    public function createPath()
    {
        $path = '';
        if (!empty( $this->arrayKey )) {
            $path .= $this->arrayKey . '.';
        }

        if (!empty( $this->index )) {
            $path .= $this->index . '.';
        }
        $path .= $this->key;
        return $path;

    }

    /**
     * Set inline edit support on or off
     *
     * @param $bool
     *
     * @return $this
     */
    public function inlineEdit( $bool )
    {
        $in = filter_var( $bool, FILTER_VALIDATE_BOOLEAN );
        $this->inlineEdit = $in;

        return $this;
    }

    /**
     * Render classes and extra attributes
     * @return string
     * @since 0.1.0
     */
    protected function _renderAttributes()
    {
        $return = "class='{$this->_classList()}' ";
        $return .= $this->_attributesList();

        return trim( $return );

    }

    /**
     * From array to string
     * @return string
     * @since 0.1.0
     */
    protected function _classList()
    {
        return trim( implode( ' ', $this->classes ) );

    }

    protected function _attributesList()
    {
        $returnstr = '';
        foreach ($this->attributes as $attr => $value) {
            $esc = esc_attr( $value );
            $returnstr .= "{$attr}='{$esc}' ";
        }

        return trim( $returnstr );

    }


}
