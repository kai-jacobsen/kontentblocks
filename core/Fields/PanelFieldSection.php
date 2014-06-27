<?php
namespace Kontentblocks\Fields;

/**
 * Class PanelFieldSection
 * @package Kontentblocks\Fields
 */
class PanelFieldSection extends FieldSection {


	/**
	 * Constructor
	 *
	 * @param string $id
	 * @param $args
	 * @param $envVars
	 * @param Panel $Panel
	 * @internal param array $areaContext
	 * @return \Kontentblocks\Fields\FieldSection
	 */
	public function __construct($id, $args, $envVars, $Panel)
	{
		$this->id = $id;
		$this->args = $this->prepareArgs($args);
		$this->envVars = $envVars;
		$this->Panel = $Panel;

	}



	/**
	 * Set visibility of field based on environment vars given by the module
	 * @param Field $field
	 * @return mixed
	 */
	public function markByEnvVar(Field $field)
	{
		return $field->setDisplay(true);
	}

}