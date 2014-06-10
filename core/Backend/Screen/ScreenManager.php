<?php

namespace Kontentblocks\Backend\Screen;

use Exception;
use Kontentblocks\Backend\Environment\PostEnvironment;

class ScreenManager {

	/**
	 * Raw areas are all areas which are available in the current environment
	 * e.g. are assigned to current page template and/or post type
	 * @var array
	 * @since 1.0.0
	 */
	protected $rawAreas;

	/**
	 * TODO: What is this?
	 * @var array
	 * @since 1.0.0
	 */
	protected $postAreas;

	/**
	 * Environment Instance
	 * @var \Kontentblocks\Backend\Environment\PostEnvironment
	 * @since 1.0.0
	 */
	protected $Environment;

	/**
	 * Definition of possible sections for the edit screen
	 * A context does not get rendered if there are no areas
	 * assigned to it.
	 * @var array
	 * @since 1.0.0
	 */
	protected $contextLayout;

	/**
	 * Final sorted assignment of areas to regions
	 * TODO: Var name sucks
	 * @var array
	 * @since 1.0.0
	 */
	protected $regions;

	/**
	 * Indicates if sidebars exists or not
	 * @var boolean
	 * @since 1.0.0
	 */
	protected $hasSidebar;

	/**
	 * Class Constructor
	 *
	 * @param PostEnvironment $Environment
	 *
	 * @throws \Exception
	 */
	public function __construct( PostEnvironment $Environment ) {
		// setup raw areas
		$this->rawAreas = $Environment->get( 'areas' );
		// set this environment
		$this->Environment = $Environment;
		//setup region layout
		$this->contextLayout = self::getDefaultContextLayout();
		// setup filtered areas
		$this->contexts = $this->areasSortedByContext( $this->rawAreas );
		// test if final context layout includes an sidebar
		// e.g. if an non-dynamic area is assigned to 'side'
		$this->hasSidebar = $this->evaluateLayout();
	}


	/**
	 * Instantiate a context object for each context and render
	 * @since 1.0.0
	 */
	public function render() {
		foreach ( $this->contextLayout as $contextId => $args ) {
			// delegate the actual output to ScreenContext
			$context = new ScreenContext( $args, $this );
			$context->render();
		}

	}

	/**
	 * Sort raw Area definitions to array
	 * @throws Exception
	 * @return array
	 * @since 1.0.0
	 */
	public function areasSortedByContext() {
		$areas = array();

		if ( ! $this->rawAreas ) {
			return array();
		}

		foreach ( $this->rawAreas as $area ) {
			if ( ! $area['dynamic'] ) {
				$areas[ $area['context'] ][ $area['id'] ] = $area;
			}
		}

		return $areas;
	}


	/**
	 * Getter to retrieve areas by context id
	 *
	 * @param $id
	 *
	 * @return array
	 * @since 1.0.0
	 */
	public function getContextAreas( $id ) {
		if ( isset( $this->contexts[ $id ] ) ) {
			return $this->contexts[ $id ];
		} else {
			return array();
		}

	}

	/**
	 * Getter for available areas on post
	 * @return array
	 * @since 1.0.0
	 */
	public function getPostAreas() {
		return $this->postAreas;

	}

	/**
	 * Getter for all areas
	 * @return array
	 * @since 1.0.0
	 */
	public function getRawAreas() {
		return $this->rawAreas;

	}

	/**
	 * Getter for Environment instance
	 * @return PostEnvironment
	 * @since 1.0.0
	 */
	public function getEnvironment() {
		return $this->Environment;
	}


	/**
	 * Default Context Layout
	 *
	 * @return array default context layout
	 * @filter kb_default_context_layout
	 * @since 1.0.0
	 */
	public static function getDefaultContextLayout() {
		$defaults = array(
			'top'    => array(
				'id'          => 'top',
				'title'       => __( 'Page header', 'kontentblocks' ),
				'description' => apply_filters( 'kb_context_description_top', '' )
			),
			'normal' => array(
				'id'          => 'normal',
				'title'       => __( 'Content', 'kontentblocks' ),
				'description' => apply_filters( 'kb_context_description_content', '' )
			),
			'side'   => array(
				'id'          => 'side',
				'title'       => __( 'Page Sidebar', 'kontentblocks' ),
				'description' => apply_filters( 'kb_context_description_side', '' )
			),
			'bottom' => array(
				'id'          => 'bottom',
				'title'       => __( 'Footer', 'kontentblocks' ),
				'description' => apply_filters( 'kb_context_description_bottom', '' )
			)
		);

		// plugins may change this
		return apply_filters( 'kb_default_context_layout', $defaults );

	}

	/**
	 * Test if sidebars are available
	 * @return bool
	 * @since 1.0.0
	 */
	public function evaluateLayout() {
		return ( ! empty( $this->contexts['side'] ) );

	}

	/**
	 * Get sidebar indicator flag
	 * @return bool
	 * @since 1.0.0
	 */
	public function hasSidebar() {
		return $this->hasSidebar;
	}

}
