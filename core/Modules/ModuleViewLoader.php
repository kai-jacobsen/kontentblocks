<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Templating\CoreTemplate;

class ModuleViewLoader {

	/**
	 * @var \Kontentblocks\Modules\ModuleViewFilesystem
	 */
	protected $ViewFilesystem;

	/**
	 * @var array
	 */
	protected $views;

	protected $hasTemplates = false;

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
			$this->hasTemplates = true;
		}
		add_action( 'kb_save_frontend_module', array( $this, 'frontendSave' ) );
	}

	public function render() {

		if ( $this->hasTemplates() ) {
			$tpl = new CoreTemplate( 'view-selector.twig',
				array( 'templates' => $this->prepareTemplates(), 'module' => $this->Module ) );

			return $tpl->render();
		} else {
			$tpl = $this->getSingleTemplate();
			if ( is_null( $tpl ) ) {
				return "<p class='notice kb-field'>No View available</p>";
			} else {
				$this->Module->assignViewFile( $tpl['filteredfile'] );

				return "<input type='hidden' name='{$this->Module->instance_id}[viewfile]' value='{$tpl['filteredfile']}' >";
			}
		}
	}


	/**
	 *
	 * @return bool
	 */
	public function hasTemplates() {
		return $this->hasTemplates;
	}

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

	private function findDefaultTemplate() {

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

	private function isValidTemplate( $setByModule ) {

		foreach ( $this->views as $view ) {
			if ( $setByModule === $view['file'] ) {
				return true;
			}
		}

		return false;
	}

	public function getTemplateByName( $name ) {
		if ( isset( $this->views[ $name ] ) ) {
			return $this->views[ $name ];
		} else {
			return null;
		}
	}

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

	private function getSingleTemplate() {
		if ( count( $this->views ) === 1 ) {
			return array_pop( $this->views );
		}
	}
} 