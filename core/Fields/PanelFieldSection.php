<?php
namespace Kontentblocks\Fields;

/**
 * Class PanelFieldSection
 * @package Kontentblocks\Fields
 */
class PanelFieldSection extends AbstractFieldSection {


	/**
	 * Constructor
	 *
	 * @param string $id
	 * @param $args
	 * @param $envVars
	 * @param Panel $Panel
	 *
	 * @internal param array $areaContext
	 * @TODO // revise envVars
	 * @return \Kontentblocks\Fields\PanelFieldSection
	 */
	public function __construct( $id, $args, $envVars, $Panel ) {
		$this->id      = $id;
		$this->args    = $this->prepareArgs( $args );
		$this->envVars = $envVars;
		$this->module   = $Panel;

	}


	/**
	 * Set visibility of field based on environment vars given by the Panel
	 * Panels have no envVars yet
	 *
	 * @param Field $Field
	 *
	 * @return mixed
	 */
	public function markByEnvVar( Field $Field ) {
		 $Field->setDisplay( true );
	}

}