<?php

namespace Kontentblocks\Fields;

/**
 * @todo: finish
 */
class FieldCollection {

	protected $fields;
	public $value;


    /**
     *
     * @param $fields
     */
    public function __construct( $fields ) {
		$this->fields = $fields;
		$this->setupFields();
	}

	public function setupFields() {
		$collect = array();

        /** @var Field $field */
        foreach ( $this->fields as $field ) {
			$fieldkey                    = $field->getKey();
			$this->$fieldkey             = $field->getUserValue();
			$collect[ $field->getKey() ] = $field->getUserValue();
		}
		$this->value = $collect;
	}

    /**
     * @param $key
     * @return mixed
     */
    public function get( $key ) {
		return $this->$key;
	}

    /**
     * @return mixed
     */
    public function getItems() {
		return $this->value;
	}

}
