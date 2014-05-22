<?php

namespace Kontentblocks\Abstracts;

use Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Interfaces\InterfaceFieldReturn;


abstract class AbstractEditableFieldReturn implements InterfaceFieldReturn {

	public $value;

	public $moduleId;

	public $key;

	public $arrayKey;

	public $index = null;

	private $field = null;

	protected $inlineEdit = true;

	protected $uniqueId;

	public function __construct( $value, $field ) {
		$this->setValue( $value );
		$this->setupFromField( $field );
		$this->uniqueId = $this->createUniqueId();
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

	/**
	 * Make this usable in twig templates without voodoo
	 * @return mixed
	 */
	public function __toString() {
		return $this->value;
	}

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
	 * @TODO Rethink array mode, was a hack
	 *
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

	private function createUniqueId() {

		$uid = '';
		$uid .= 'kb_';
		$uid .= $this->field->getBaseId();
		$uid .= $this->field->getKey();
		if ( $this->field->getArg( 'index' ) ) {
			$uid .= $this->field->getArg( 'index' );
		}

		return $uid;

	}

}
