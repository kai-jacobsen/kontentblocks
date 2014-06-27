<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Interfaces\InterfaceFieldReturn;


abstract class AbstractEditableFieldReturn implements InterfaceFieldReturn {

	public $value;

	public $moduleId;

	public $key;

	public $arrayKey;

	public $index = null;

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

	protected $inlineEdit = true;

	protected $uniqueId;

	public function __construct( $value, $field ) {
		$this->setValue( $value );
		$this->setupFromField( $field );
		$this->uniqueId = $this->createUniqueId();
		$this->prepare();
	}

	/**
	 * Add a (css) class to the stack of classes
	 *
	 * @param string $class
	 *
	 * @return $this
	 * @since 1.0.0
	 */
	public function addClass( $class ) {
		if ( is_array( $class ) ) {
			$this->classes = array_merge( $this->classes, $class );
		} else {
			$this->classes = array_merge( explode( ' ', $this->_cleanSpaces( $class ) ), $this->classes );
		}

		return $this;

	}

	/**
	 * Add an attribute to the stack of attributes
	 *
	 * @param string $attr
	 * @param string $value
	 *
	 * @return $this
	 * @since 1.0.0
	 */
	public function addAttr( $attr, $value = '' ) {
		if ( is_array( $attr ) ) {
			$this->attributes = array_merge( $this->attributes, $attr );
		} else {
			if ( $value !== false ) {
				$this->attributes[ $attr ] = $value;
			}
		}

		return $this;

	}

	/**
	 * Helper to remove spaces
	 *
	 * @param $string
	 *
	 * @return string|void
	 * @since 1.0.0
	 */
	private function _cleanSpaces( $string ) {
		return esc_attr( preg_replace( '/\s{2,}/', ' ', $string ) );

	}

	/**
	 * Getter for value
	 *
	 * @param null $arraykey
	 *
	 * @return array
	 */
	public function getValue( $arraykey = null ) {
		if ( is_array( $this->value ) && ! is_null( $arraykey ) ) {
			if ( isset( $this->value[ $arraykey ] ) ) {
				return $this->value[ $arraykey ];
			}
		}

		return $this->value;

	}

	abstract function getEditableClass();

	abstract function html();


	/**
	 * Add some classes and attributes dynmaically if inline support is active
	 * and the user is logged in
	 */
	public function handleLoggedInUsers() {
		if ( is_user_logged_in() && $this->inlineEdit ) {
			$editableClass = $this->getEditableClass();
			$this->addClass( $editableClass );
			$this->addAttr( 'data-module', $this->moduleId );
			$this->addAttr( 'data-key', $this->key );
			$this->addAttr( 'data-arrayKey', $this->arrayKey );
			if ( ! is_null( $this->index ) ) {
				$this->addAttr( 'data-index', $this->index );
			}
			$this->addAttr( 'data-uid', $this->uniqueId );
		}
	}

	/**
	 * Set inline edit support on or off
	 *
	 * @param $bool
	 *
	 * @return $this
	 */
	public function inlineEdit( $bool ) {
		$in               = filter_var( $bool, FILTER_VALIDATE_BOOLEAN );
		$this->inlineEdit = $in;

		return $this;
	}

	public function setValue( $value ) {

		$this->value = $value;
	}

	/**
	 * @param $field
	 */
	private function setupFromField( $field ) {
		if ( is_array( $field ) ) {
			$Dummy = FieldRegistry::getInstance()->getField( $field['type'] );
			$Dummy->setKey( $field['key'] );
			$Dummy->setArgs( array(
				'arrayKey' => $field['arrayKey'],
				'index'    => ( $field['index'] ) ? $field['index'] : null
			) );
			$Dummy->setBaseId( $field['instance_id'] );
			$Dummy->setType( $field['type'] );
			$Dummy->setData( $this->getValue() );
			$field = $this->field = $Dummy;

		}

		if ( is_object( $field ) ) {
			$this->moduleId = $field->parentModuleId;
			$this->key      = $field->getKey();
			$this->arrayKey = $field->getArg( 'arrayKey' );
			$this->index    = $field->getArg( 'index' );
			$this->field    = $field;
		}
		// @TODO Input Validation and error handling

	}

	protected  function createUniqueId() {

		$uid = '';
		$uid .= 'kb_';
		$uid .= $this->field->getBaseId();
		$uid .= $this->field->getKey();
		if ( $this->field->getArg( 'index' ) ) {
			$uid .= $this->field->getArg( 'index' );
		}

		return $uid;

	}


	/**
	 * Render classes and extra attributes
	 * @return string
	 * @since 1.0.0
	 */
	protected  function _renderAttributes() {
		$return = "class='{$this->_classList()}' ";
		$return .= $this->_attributesList();

		return trim( $return );

	}

	/**
	 * From array to string
	 * @return string
	 * @since 1.0.0
	 */
	protected  function _classList() {
		return trim( implode( ' ', $this->classes ) );

	}

	protected  function _attributesList() {
		$returnstr = '';
		foreach ( $this->attributes as $attr => $value ) {
			$returnstr .= "{$attr}='{$value}' ";
		}

		return trim( $returnstr );

	}

	protected abstract  function prepare();



}
