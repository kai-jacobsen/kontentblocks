<?php
namespace Kontentblocks\Templating;

use Exception;
use Kontentblocks\Utils\MobileDetect;

class ModuleTemplate {

	/**
	 * @var object  Module Instance
	 */
	protected $module;

	/**
	 * @var array   merged from module data and additional injected data
	 */
	protected $data;

	/**
	 * @var string filename of twig file
	 */
	protected $tplFile;

	/**
	 * @var TWIG engine
	 */
	protected $engine;

	/**
	 * Class Constructor
	 *
	 * @param \Kontentblocks\Modules\Module
	 * @param bool $tpl
	 * @param array $addData
	 *
	 * @throws Exception
	 */
	public function __construct( $module, $tpl = false, $addData = array() ) {

		if ( !isset( $module ) || !is_object( $module ) ) {
			throw new \Exception( 'Module is not set' );
		}

		$this->module = $module;

		// merge module data and additional injected data
		$this->data = $this->_setupData( $module->moduleData, $addData );

		// if no tpl is given, set a default
		// @TODO Kinda useless, things should break in that case
		$this->tplFile = ( $tpl !== false ) ? $tpl : get_class( $module ) . '.twig';

		$this->engine = Twig::getInstance();
	}

	public function render( $echo = false ) {
		$modulePath = $this->module->getPath();
		if ( !empty( $modulePath ) ) {
			if ( is_file( trailingslashit( $modulePath ) . $this->tplFile ) ) {
				$this->setPath( $this->module->settings['path'] );
			}
		}

		if ( $echo ) {
			$this->engine->display( $this->tplFile, $this->data );
		} else {
			return $this->engine->render( $this->tplFile, $this->data );
		}

	}

	public function setPath( $path ) {
		Twig::setPath( $path );

	}

	public function __destruct() {
		//Twig::resetPath();

	}

	/**
	 * Setup Template Data
	 * Merges Instance Data with optional additional data
	 * sets up class property $data
	 *
	 * @param array $modData
	 * @param array $addData
	 *
	 * @return array
	 */
	private function _setupData( $modData, $addData ) {
		if ( $addData ) {
			$data = wp_parse_args( $addData, $modData );
		} else {
			$data = $modData;
		}

		if ( !is_array( $data ) ) {
			$data = array();
		}

		$data['module'] = $this->module->toJSON();

		// make sure there is a key value pair, if not
		// make 'data' the default key
		if ( !is_array( $data ) ) {
			$data = array(
				'data' => $data
			);
		}

		$data['utils'] = $this->setupUtilities();

		return $data;

	}

	private function setupUtilities() {
		return array(
			'MobileDetect' => MobileDetect::getInstance()
		);
	}

	public function addData( $data ) {

		if ( !is_array( $data ) ) {
			return false;
		}

		$this->data = wp_parse_args($data, $this->data);
		return true;
	}

}