<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Utils\JSONBridge;

/**
 * Flexible Fields
 * Additional args are:
 * TODO: document configuration
 *
 */
Class FlexibleFields extends Field {

	// Defaults
	public static $defaults = array(
		'returnObj' => false,
		'type'      => 'flexible-fields'
	);

	/**
	 * Form
	 */
	public function form() {
		$this->label();
		echo "<div id='{$this->getFieldId()}' data-fieldkey='{$this->key}' data-module='{$this->parentModuleId}' class='flexible-fields--stage'></div>";
		$this->description();

	}

	public function outputFilter( $value ) {
		// make sure it's an simple indexed array to preserve order
		if ( is_array( $value ) ) {
			$forJSON = array_values( $value );
		}
		$Bridge = JSONBridge::getInstance();
		$Bridge->registerFieldData( $this->parentModuleId, $this->type, $forJSON );

		return $value;
	}

	/**
	 * To make sure that the saving routine doesn't preserve unset
	 * items from the old data (which is its purpose)
	 * we need to set deleted items explicitly to NULL
	 * This will remove the data from the $old data while saving
	 *
	 * @param mixed $new
	 * @param mixed $old
	 *
	 * @return mixed $new
	 */
	public function save( $new, $old ) {


		if ( is_array( $old ) ) {
			foreach ( $old as $k => $v ) {
				if ( ! array_key_exists( $k, $new ) ) {
					$new[ $k ] = null;
				}
			}
		}
		foreach ( $new as &$field ) {
			if ( is_null( $field ) ) {
				continue;
			}

			foreach ( $field['_mapping'] as $key => $type ) {
				$fieldInstance          = FieldRegistry::getInstance()->getField( $type );
				$field[ $key ] = $fieldInstance->save( $field[ $key ], $old );
			}

		}
		return $new;
	}


}