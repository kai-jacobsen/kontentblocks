<?php

namespace Kontentblocks\Fields;

/**
 * Class FieldArray
 * To group a set of x field under one key
 * @package Kontentblocks\Fields
 */
class FieldArray {

	/**
	 *
	 * @var string
	 * @since 1.0.0
	 */
	protected $key;

	/**
	 * Attached fields
	 * @var array
	 * @since 1.0.0
	 */
	protected $fields;

	/**
	 * @var base id
	 * @since 1.0.0
	 */
	protected $baseId;

	/**
	 * @var Returnobjects\ArrayFieldReturn
	 * @since 1.0.0
	 */
	protected $returnObj;

	/**
	 * Class constructor
	 * @since 1.0.0
	 * @param string $key
	 */
	public function __construct( $key ) {
		$this->key = $key;
	}

	/**
	 * Add field
	 *
	 * @param string $key
	 * @param object $fieldobject
	 * @since 1.0.0
	 * @return $this
	 */
	public function addField( $key, $fieldobject ) {
		$this->fields[ $key ] = $fieldobject;
		return $this;

	}

	/**
	 * Wrapper to each fields setup method
	 *
	 * @param $instanceData
	 * @param $baseId
	 * @since 1.0.0
	 */
	public function setup( $instanceData, $baseId ) {
		foreach ( $this->fields as $field ) {
			$fielddata = ( ! empty( $instanceData[ $field->getKey() ] ) ) ? $instanceData[ $field->getKey() ] : $field->getArg( 'std',
				'' );
			$field->setup( $fielddata, $baseId );
		}

	}

	/**
	 * Pass through _save() method to each field
	 *
	 * @param $data
	 * @param $oldData
	 * @since 1.0.0
	 * @return array
	 */
	public function _save( $data, $oldData ) {
		$collect = array();
		foreach ( $this->fields as $field ) {

			if ( isset( $data[ $field->getKey() ] ) ) {
				$old = ( isset( $oldData[ $field->getKey() ] ) ) ? $oldData[ $field->getKey() ] : null;
				$collect[ $field->getKey() ] = $field->_save( $data[ $field->getKey() ], $old );
			} else {
				$collect[ $field->getKey() ] = $field->_save( null );
			}
		}

		return $collect;

	}

	/**
	 * Getter for $key
	 * @since 1.0.0
	 * @return string
	 */
	public function getKey() {
		return $this->key;

	}

	/**
	 * Special Return Object
	 * will setup each fields return object seperately
	 * @return object Returnobjects\ArrayFieldReturn
	 * @since 1.0.0
	 */
	public function getReturnObj() {
		$this->returnObj = new Returnobjects\ArrayFieldReturn( $this->fields );

		return $this->returnObj;

	}

	/**
	 * Passes the setBaseId() call through to the actual field method
	 * Modifies the baseId to setup the array nature
	 * Called by a section handler
	 * Part of the backend form rendering process
	 *
	 * @param string $baseId
	 * @since 1.0.0
	 */
	public function setBaseId( $baseId ) {
		foreach ( $this->fields as $field ) {
			$field->setBaseId( $baseId, $this->key );
		}

	}

	/**
	 * Pass through of section handler setData() on field call
	 * Ensures each child field receives its corresponding data
	 * Part of the backend form rendering process
	 *
	 * @param array $data
	 * @since 1.0.0
	 */
	public function setData( $data ) {
		foreach ( $this->fields as $field ) {
			$fielddata = ( ! empty( $data[ $field->getKey() ] ) ) ? $data[ $field->getKey() ] : '';
			$field->setData( $fielddata );
		}

	}

	/**
	 * Pass through build() method call to child fields
	 * @since 1.0.0
	 * @return void
	 */
	public function build() {
		foreach ( $this->fields as $field ) {
			$field->build();
		}

	}

}
