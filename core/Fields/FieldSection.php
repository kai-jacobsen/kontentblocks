<?php

namespace Kontentblocks\Fields;

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
		$this->Emitter = $module;

	}

	/**
	 * Set visibility of field based on environment vars given by the module
	 * By following a hierachie: PostType -> PageTemplate -> AreaContext
	 *
	 * @param \Kontentblocks\Fields\Field $field
	 *
	 * @return void
	 */
	public function markVisibility( Field $field ) {
		$areaContext  = $this->envVars['areaContext'];
		$postType     = $this->envVars['postType'];
		$pageTemplate = $this->envVars['pageTemplate'];

		if ( $this->Emitter->getSetting( 'useViewLoader' ) ) {
			$moduleTemplate = $this->Emitter->getViewfile();
			if ( $field->getArg( 'viewfile' ) && !in_array( $moduleTemplate, (array) $field->getArg( 'viewfile' ) ) ) {
				$field->setDisplay( false );

				return;
			}
		}


		if ( $field->getArg( 'postType' ) && !in_array( $postType, (array) $field->getArg( 'postType' ) ) ) {
			$field->setDisplay( false );

			return;
		}

		if ( $field->getArg( 'pageTemplate' ) && !in_array( $pageTemplate,
				(array) $field->getArg( 'pageTemplate' ) )
		) {
			$field->setDisplay( false );

			return;
		}

		if ( !isset( $areaContext ) || $areaContext === false || ( $field->getArg( 'areaContext' ) === false ) ) {
			$field->setDisplay( true );

			return;
		} else if ( in_array( $areaContext, $field->getArg( 'areaContext' ) ) ) {
			$field->setDisplay( true );

			return;
		}

		$this->_decreaseVisibleFields();

		$field->setDisplay( false );

		return;
	}


}
