<?php

namespace Kontentblocks\Fields\Returnobjects;

/**
 * Class DefaultFieldReturn
 * @package Kontentblocks\Fields\Returnobjects
 * @since 1.0.0
 */
class DefaultFieldReturn {

	/**
	 * Field value
	 * @var mixed
	 */
	protected $value;

	public function __contruct( $value ) {
		$this->value = $value;
	}

	public function __toString() {
		d($this);
		return $this->value;
	}

}