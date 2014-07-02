<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Templating\CoreTemplate;

/**
 * Class ModuleViewLoader
 * @package Kontentblocks\Modules
 */
class ModuleViewLoader {

	/**
	 *
	 * @var \Kontentblocks\Modules\ModuleViewFilesystem
	 */
	protected $ViewFilesystem;

	/**
	 * found views
	 * @var array
	 */
	protected $views;

	/**
	 * Flag views
	 * @var bool
	 */
	protected $hasViews = false;

	/**
	 * The Module
	 * @var Module
	 */
	private $Module;

	/**
	 * Class constructor
	 *
	 * @param Module $Module
	 */
	public function __construct( Module $Module ) {
		$this->ViewFilesystem = ModuleViewsRegistry::getInstance()->getViewFileSystem( $Module );
		$this->Module         = $Module;
		$this->views          = $this->ViewFilesystem->getTemplatesforContext( $Module->getAreaContext() );
		if ( count( $this->views ) > 1 ) {
			$this->hasViews = true;
		}

		/**
		 * register handler to save the user choice when the frontend edit module saves
		 */
		add_action( 'kb_save_frontend_module', array( $this, 'frontendSave' ) );
	}

	/**
	 * Render the viewfile select field
	 * @return bool|string
	 */
	public function render() {

		if ( $this->hasViews() ) {
			$tpl = new CoreTemplate( 'view-selector.twig',
				array( 'templates' => $this->prepareTemplates(), 'module' => $this->Module ) );

			return $tpl->render();
		} else {
			$tpl = $this->getSingleTemplate();
			if ( is_null( $tpl ) ) {
				return "<p class='notice kb-field'>No View available</p>";
			} else {
				$this->Module->setViewFile( $tpl['filteredfile'] );

				return "<input type='hidden' name='{$this->Module->instance_id}[viewfile]' value='{$tpl['filteredfile']}' >";
			}
		}
	}


	/**
	 * Check if files are available
	 * @return bool
	 */
	public function hasViews() {
		return $this->hasViews;
	}

	/**
	 * Prepare templates for view select field
	 * @return array
	 */
	private function prepareTemplates() {

		$prepared = array();
		$selected = $this->Module->getViewfile();

		if ( empty( $selected ) ) {
			$selected = $this->findDefaultTemplate();
		}

		foreach ( $this->views as $item ) {
			$item['selected'] = ( $item['filteredfile'] === $selected ) ? "selected='selected'" : '';
			$prepared[]       = $item;
		}

		return $prepared;
	}

	/**
	 * Lookup the default viewfile to use.
	 * A module can specify the default template by implementing 'defaultView'
	 * That method must return a valid .twig file in the paths of the loader
	 *
	 * the first view in the found viewfiles is returned as fallback
	 * @return string
	 */
	public function findDefaultTemplate() {

		if ( method_exists( $this->Module, 'defaultView' ) ) {
			$setByModule = $this->Module->defaultView();

			if ( !empty( $setByModule ) && $this->isValidTemplate( $setByModule ) ) {
				return $setByModule;
			}
		} else {
			$first = $this->views[0];

			return $first['file'];
		}
	}

	/**
	 * Test if the file returned by a modules 'defaultView' method is valid
	 *
	 * @param $setByModule
	 *
	 * @return bool
	 */
	private function isValidTemplate( $setByModule ) {

		foreach ( $this->views as $view ) {
			if ( $setByModule === $view['file'] ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param $name
	 *
	 * @return null
	 */
	public function getTemplateByName( $name ) {
		if ( isset( $this->views[ $name ] ) ) {
			return $this->views[ $name ];
		} else {
			return null;
		}
	}

	/**
	 * Callback handler, when the viewfile gets changed on the frontend
	 *
	 * @param $module
	 */
	public function frontendSave( $module ) {

		if ( !isset( $module['viewfile'] ) || empty( $module['viewfile'] ) ) {
			return;
		}
		$postId = $module['post_id'];
		/** @var \Kontentblocks\Backend\Storage\ModuleStoragePostMeta $Storage */
		$Storage           = \Kontentblocks\Helper\getStorage( $postId );
		$index             = $Storage->getModuleDefinition( $module['instance_id'] );
		$index['viewfile'] = $module['viewfile'];
		$Storage->addToIndex( $module['instance_id'], $index );
	}

	/**
	 * If there is is only one file, use it
	 * @return string
	 */
	private function getSingleTemplate() {
		if ( count( $this->views ) === 1 ) {
			return array_pop( $this->views );
		}
	}
} 