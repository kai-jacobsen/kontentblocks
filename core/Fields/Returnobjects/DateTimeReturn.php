<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Interfaces\InterfaceFieldReturn;

/**
 * Class DateTime
 * @package Kontentblocks\Fields\Returnobjects
 */
class DateTimeReturn implements InterfaceFieldReturn {

	protected $value;

	public $Field;
	/**
	 * @var \DateTime
	 */
	public $DateTime;

	public function __construct( $value, $Field ) {

		if (!isset($value['unix'])){
			trigger_error('No valid input array for DateTimeReturn', E_USER_WARNING);
			return;
		}

		$this->value = $value;
		$this->Field = $Field;
		$this->DateTime = new \DateTime('@'.$value['unix']);

	}



	public function getValue() {
		// TODO: Implement getValue() method.
	}

	public function handleLoggedInUsers() {
		// noop
	}
}