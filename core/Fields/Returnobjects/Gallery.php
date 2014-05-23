<?php

namespace Kontentblocks\Fields\Returnobjects;

class Gallery {

	protected $field;

	protected $value;

	public $images = array();

	public function __construct( $value, $Field ) {


		$this->field = $Field;
		$this->value = $value;


		if ( isset($value['images']) && is_array( $value['images'] ) ) {
			$this->setupMediaElements();
		}

	}

	/**
	 * Create image objects from input
	 */
	private function setupMediaElements() {

		foreach ( $this->value['images'] as $element ) {
			if ( isset( $element['file'] ) && ! empty( $element['file'] ) ) {
				array_push($this->images, new Utilities\ImageObject( $element['file'] ));
			}
		}

	}

}