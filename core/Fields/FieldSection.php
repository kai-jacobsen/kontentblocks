<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Fields\FieldRegistry,
	Kontentblocks\Fields\FieldArray;
use Kontentblocks\Modules\Module;

/**
 * Purpose of this Class:
 *
 * This serves as a collection handler for fields and offers
 * methods to interact with registered fields.
 *
 * Gets instantiated by Kontentblocks\Fields\FieldManager when
 * addGroup() is called
 *
 * @see Kontentblocks\Fields\FieldManager::addSection()
 * @package Fields
 * @package Fields
 * @since 1.0.0
 */
class FieldSection extends AbstractFieldSection {


	/**
	 * Constructor
	 *
	 * @param string $id
	 * @param $args
	 * @param $envVars
	 * @param Module $module
	 *
	 * @internal param array $areaContext
	 * @return \Kontentblocks\Fields\FieldSection
	 */
	public function __construct( $id, $args, $envVars, $module ) {

		$this->id      = $id;
		$this->args    = $this->prepareArgs( $args );
		$this->envVars = $envVars;
		$this->module  = $module;

	}

	/**
	 * Set visibility of field based on environment vars given by the module
	 * By following a hierachie: PostType -> PageTemplate -> AreaContext
	 *
	 * @param Field $field
	 *
	 * @return mixed
	 */
	public function markByEnvVar( Field $field ) {
		$areaContext  = $this->envVars['areaContext'];
		$postType     = $this->envVars['postType'];
		$pageTemplate = $this->envVars['pageTemplate'];

		if ( $this->module->getSetting( 'useViewLoader' ) ) {
			$moduleTemplate = $this->module->getViewfile();
			if ( $field->getArg( 'viewfile' ) && !in_array( $moduleTemplate, (array) $field->getArg( 'viewfile' ) ) ) {
				return $field->setDisplay( false );
			}
		}


		if ( $field->getArg( 'postType' ) && !in_array( $postType, (array) $field->getArg( 'postType' ) ) ) {
			return $field->setDisplay( false );
		}

		if ( $field->getArg( 'pageTemplate' ) && !in_array( $pageTemplate,
				(array) $field->getArg( 'pageTemplate' ) )
		) {
			return $field->setDisplay( false );
		}

		if ( !isset( $areaContext ) || $areaContext === false || ( $field->getArg( 'areaContext' ) === false ) ) {
			return $field->setDisplay( true );
		} else if ( in_array( $areaContext, $field->getArg( 'areaContext' ) ) ) {
			return $field->setDisplay( true );
		}

		$this->_decreaseVisibleFields();

		return $field->setDisplay( false );
	}



}
