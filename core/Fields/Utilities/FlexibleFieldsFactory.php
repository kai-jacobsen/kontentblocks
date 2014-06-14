<?php

namespace Kontentblocks\Fields\Utilities;

use Kontentblocks\Fields\Definitions\FlexibleFields;
use Kontentblocks\Fields\Returnobjects\Element;
use Kontentblocks\Fields\Returnobjects\Image;

/**
 * Class FlexibleFieldsFactory
 * @package Kontentblocks\Fields\Utilities
 * @since 1.0.0
 */
class FlexibleFieldsFactory {

	/**
	 * @var \Kontentblocks\Fields\Definitions\FlexibleFields
	 */
	protected $Field;

	/**
	 * @var string id of parent module
	 */
	protected $moduleId;

	/**
	 * @var string
	 */
	protected $arrayKey;

	/**
	 * @var array data of this field from moduleData
	 */
	protected $fieldData;

	/**
	 * Flexible Field config array
	 * @var array
	 */
	protected $config;

	/**
	 * Class Constructor
	 * @since 1.0.0
	 *
	 * @param FlexibleFields $Field
	 */
	public function __construct( $value, FlexibleFields $Field ) {
		$this->Field = $Field;

		$this->arrayKey  = $Field->getKey();
		$this->fieldData = $Field->getValue();
		$this->moduleId  = $Field->parentModuleId;
		$this->config    = $Field->getArg( 'config' );

	}

	/**
	 * Get prepared saved items
	 * @since 1.0.0
	 * @return array|bool
	 */
	public function getItems() {
		// check properties integrity
		if ( ! $this->validate() ) {
			return false;
		};

		$items = $this->setupItems();

		if ( ! is_array( $items ) ) {
			return array();
		}

		return $items;
	}

	/**
	 * Iterate through fields and set up
	 * @since 1.0.0
	 * @return array
	 */
	public function setupItems() {
		$fields = $this->extractFieldsFromConfig();
		$items  = array();
		foreach ( $this->fieldData as $index => $data ) {
			$item = array();
			foreach ( $fields as $key => $conf ) {
				$item[ $key ] = $this->getReturnObj( $conf['type'], $data[ $key ], $index, $key );
			}
			$items[] = $item;
		}

		return $items;
	}

	/**
	 * Validate if all necessary props are set
	 * @since 1.0.0
	 * @return bool
	 */
	private function validate() {

		if ( empty( $this->fieldData ) ) {
			return false;
		}

		if ( ! isset( $this->moduleId ) ) {
			return false;
		}

		if ( ! isset( $this->arrayKey ) ) {
			return false;
		}

		if ( ! isset( $this->config ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Collect all fields to one array
	 * @return array
	 */
	private function extractFieldsFromConfig() {
		$collect = array();
		foreach ( $this->config as $key => $tab ) {
			if ( ! empty( $tab['fields'] ) ) {
				$collect += $tab['fields'];
			}
		}

		return $collect;
	}

	/**
	 * Sets up the correct ReturnObject for each field
	 * before frontend rendering
	 * @TODO Should not be the responsibility of the AbstractEditableFieldReturn Class to create proper Fields
	 * @TODO see AbstractEditableFieldSetup
	 *
	 * @param $type string
	 * @param $keydata array
	 * @param $index string
	 * @param $key string
	 *
	 * @since 1.0.0
	 * @return Element|Image
	 */
	private function getReturnObj( $type, $keydata, $index, $key ) {
		switch ( $type ) {

			case ( 'text' ):
			case ( 'editor' ):
			case ( 'textarea' ):
				return new Element( $keydata, array(
					'instance_id' => $this->moduleId,
					'key'         => $key,
					'arrayKey'    => $this->arrayKey,
					'index'       => $index,
					'type'        => $type
				) );

				break;

			case ( 'image' ):
				return new Image( $keydata, array(
					'instance_id' => $this->moduleId,
					'key'         => $key,
					'arrayKey'    => $this->arrayKey,
					'index'       => $index,
					'type'        => $type
				) );
				break;
		}
	}

	public function __toArray(){
		return $this->getItems();
	}

}