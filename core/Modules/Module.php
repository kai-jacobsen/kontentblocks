<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Fields\FieldManager;
use Kontentblocks\Templating\ModuleTemplate;
use Kontentblocks\Templating\ModuleView;


abstract class Module {

	/**
	 * Environment vars
	 *
	 * @var array
	 */
	public $envVars;

	/**
	 * @var array
	 */
	public $settings;

	/**
	 * The actual module data
	 * Data may be modified by Refields and/or other filters
	 * This data will no stay consistent throughout the request
	 * @var array
	 */
	public $moduleData;

	/**
	 * The moduleData unmodified and untouched
	 * until the server dies
	 * @var array
	 */
	public $rawModuleData;

	protected $View;
	protected $ViewLoader;

	private $TemplateSelector;

	/**
	 * II. Constructor
	 *
	 * @param null $args
	 * @param array $data
	 * @param \Kontentblocks\Backend\Environment\PostEnvironment $environment
	 *
	 * @internal param string $id identifier
	 * @internal param string $name default name, can be individual overwritten
	 * @internal param array $block_settings
	 */
	function __construct( $args = null, $data = array(), PostEnvironment $environment = null ) {
		// batch setup
		$this->set( $args );

		$this->moduleData    = $data;
		$this->rawModuleData = $data;
		if ( isset( $environment ) ) {
			$this->setEnvVarsFromEnvironment( $environment );
		}


		if ( method_exists( $this, 'fields' ) ) {
			$this->Fields = new FieldManager( $this );
			$this->fields();

		}


	}

	/* -----------------------------------------------------
	 * III. Primary Block methods
	 * -----------------------------------------------------
	 */

	/**
	 * options()
	 * Method for the backend display
	 * gets called by ui display callback
	 *
	 */
	public function options( $data ) {
		if ( filter_var( $this->getSetting( 'useViewLoader' ), FILTER_VALIDATE_BOOLEAN ) ) {

			$this->ViewLoader = new ModuleViewLoader( $this );
			echo $this->ViewLoader->render();
		}

		if ( isset( $this->Fields ) && is_object( $this->Fields ) ) {
			$this->Fields->renderFields();
		}

		return false;
	}

	/**
	 * save()
	 * Method to save whatever form fields are in the options() method
	 * Gets called by the meta box save callback
	 */
	public function save( $data, $old ) {

		if ( isset( $this->Fields ) ) {
			return $this->saveFields( $data, $old );
		}

		return $data;

	}


	/**
	 * module()
	 * Frontend display method.
	 * Wrapper to actual render method.
	 */
	final public function module( $data = null ) {

		if ( is_null( $data ) && !is_null( $this->moduleData ) ) {
			$data = $this->moduleData;
		}
		if ( isset( $this->Fields ) ) {
			$this->_setupFieldData();
		}

		$this->View = $this->getView();


		if ( $this->getEnvVar( 'action' ) ) {
			if ( method_exists( $this, $this->getEnvVar( 'action' ) . 'Action' ) ) {
				$method = $this->getEnvVar( 'action' ) . 'Action';

				return call_user_func( array( $this, $method ), $data );
			}
		}

		return $this->render( $data );

	}

	/**
	 * Has no default output yet, and must be overwritten
	 */
	public abstract function render( $data );

	/**
	 * setup()
	 * Setup method gets called before block() is called
	 * Used for enqueing scripts or print inline scripts
	 * Kinda useless since there are other ways since 3.3 , but has to be verified before removed
	 * There may be older blocks, which use this method
	 */
	public function setup() {
		_deprecated_function( 'Module:setup()', '1.0.0', null );
	}


	public function saveFields( $data, $old ) {
		return $this->Fields->save( $data, $old );

	}

	public function _setupFieldData() {
		if ( empty( $this->moduleData ) || !is_array( $this->moduleData ) ) {
			return;
		}

		$this->Fields->setup( $this->moduleData );
		foreach ( $this->moduleData as $key => $v ) {
			$field                    = $this->Fields->getFieldByKey( $key );
			$this->moduleData[ $key ] = ( $field !== null ) ? $field->getReturnObj() : null;


			if ( $this->moduleData[ $key ] === null ) {
				$this->moduleData[ $key ] = $v;
			}
		}

	}



	/* -----------------------------------------------------
	 * IV. Business Logic
	 * -----------------------------------------------------
	 */

	/**
	 * Generate Block markup for whatever is inside 'options' method of a BLock
	 *
	 * @global object post
	 * @internal param \Kontentblocks\Modules\block $array
	 * @internal param $context | area context
	 * @internal param \Kontentblocks\Modules\css|\Kontentblocks\Modules\open $class kb_open added / not added
	 * @internal param array $args
	 */
	public function _render_options() {

		// open tag for block list item
		echo $this->_openListItem();

		//markup for block header
		echo $this->header();

		// inner block open
		echo $this->_openInner();


		// if disabled don't output, just show disabled message
		if ( $this->settings['disabled'] ) {
			echo "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
		} else {
			// output the form fields for this module
			if ( isset( $this->Fields ) ) {
				$this->Fields->data = $this->moduleData;
			}
			$this->options( $this->moduleData );
		}

		// essentially calls wp actions
		$this->footer();

		echo $this->_closeInner();

		echo $this->_closeListItem();

		if ( method_exists( $this, 'adminEnqueue' ) ) {
			$this->adminEnqueue();
		}


	}

	private function _openListItem() {
		// extract the block id number
		$count = strrchr( $this->instance_id, "_" );

		// classname
		$classname = get_class( $this );

		// additional classes to set for the item
		$disabledclass = ( $this->settings['disabled'] ) ? 'disabled' : null;
		$uidisabled    = ( $this->settings['disabled'] ) ? 'ui-state-disabled' : null;

		//$locked = ( $this->locked == 'false' || empty($this->locked) ) ? 'unlocked' : 'locked';
		//$predefined = (isset($this->settings['predefined']) and $this->settings['predefined'] == '1') ? $this->settings['predefined'] : null;
		$unsortable = ( ( isset( $this->unsortable ) and $this->unsortable ) == '1' ) ? 'cantsort' : null;

		// Block List Item
		return "<li id='{$this->instance_id}' rel='{$this->instance_id}{$count}' data-blockclass='{$classname}' class='{$this->settings['id']} kb_wrapper kb_block {$this->getStatusClass()} {$disabledclass} {$uidisabled} {$unsortable}'>
		<input type='hidden' name='{$this->instance_id}[areaContext]' value='$this->areaContext' />
		";

	}

	/*
	 * Close list item
	 */

	private function _closeListItem() {
		return "</li>";

	}

	/**
	 * Outputs everything inside the block
	 * @TODO clean up module header from legacy code
	 */

	private function _openInner() {
		$lockedmsg = ( !current_user_can( 'lock_kontentblocks' ) ) ? 'Content is locked' : null;

		// markup for each block
		$out = "<div style='display:none;' class='kb_inner kb-module--body'>";
		if ( $lockedmsg && KONTENTLOCK ) {
			$out = $lockedmsg;
		} else {

			$description       = ( !empty( $this->settings['description'] ) ) ? __( '<strong><em>Beschreibung:</em> </strong>' ) . $this->settings['description'] : '';
			$l18n_draft_status = ( $this->state['draft'] === true ) ? '<p class="kb_draft">' . __( 'This Module is a draft and won\'t be public until you publish or update the post',
					'kontentblocks' ) . '</p>' : '';

			$out .= "<div class='kb_block_title'>";

			if ( !empty( $description ) ) {
				// $out .= "<p class='description'>{$description}</p>";
			}
			$out .= "		<div class='block-notice hide'>
							<p>Es wurden Veränderungen vorgenommen. <input type='submit' class='button-primary' value='Aktualisieren' /></p>
						</div>
						{$l18n_draft_status}
					</div>";
			$out .= "<div class='kb-module--controls-inner'>";

		}

		return $out;

	}

	/*
	 * Close block inner
	 */

	private function _closeInner() {
		return "</div></div>";

	}

	/**
	 * Create Markup for Block Header
	 *
	 */
	private function header() {
		$html = '';

		//open header
		$html .= "<div rel='{$this->instance_id}' class='block-head clearfix edit kb-title'>";


		$html .= "<div class='kb-move'></div>";
		// toggle button
		$html .= "<div class='kb-toggle'></div>";
		$html .= "<div class='kb-fullscreen'></div>";

//        $html .= "<div class='kb-inactive-indicator js-module-status'></div>";

		// locked icon
		if ( !$this->settings['disabled'] && KONTENTLOCK ) {
			$html .= "<div class='kb-lock {$this->locked}'></div>";
		}

		// disabled icon
		if ( $this->settings['disabled'] ) {
			$html .= "<div class='kb-disabled-icon'></div>";
		}

		// name
		$html .= "<div class='kb-name'><input class='block-title kb-module-name' type='text' name='{$this->instance_id}[moduleName]' value='" . esc_attr( $this->getModuleName() ) . "' /></div>";

		// original name
		$html .= "<div class='kb-sub-name'>{$this->getSetting( 'publicName' )}</div>";

		$html .= "</div>";

		// Open the drop down menu
		$html .= "<div class='menu-wrap'></div>";


		return $html;

	}

	/*
	 * Block Footer Actions
	 */

	public function footer() {
		do_action( "block_footer_{$this->settings['id']}" );
		do_action( 'block_footer', $this );

	}


	public function _print_edit_link( $post_id = null ) {
		_doing_it_wrong( '_print_edit_link', 'Deprecated', '1.0.0' );

	}

	/**
	 * On Site Edit link for logged in users
	 * @TODO Deprecate
	 */
	public function print_edit_link( $post_id = null ) {

		global $post;
		_doing_it_wrong( 'print_edit_link', 'Deprecated', '1.0.0' );
		$edittext = ( !empty( $this->settings['os_edittext'] ) ) ? $this->setting['os_edittext'] : __( 'edit' );


		if ( $post_id === null ) {
			$post_id = ( !empty( $_REQUEST['post_id'] ) ) ? $_REQUEST['post_id'] : $post->ID;
		}


		$nonce         = wp_create_nonce( 'onsiteedit' );
		$this->editURL = admin_url() . "/admin-ajax.php?action=os-edit-module&daction=show&_wpnonce=$nonce";

	}

	/* -----------------------------------------------------
	 * V. Helper
	 * -----------------------------------------------------
	 */

	/* set()
	 * Public method to set class properties
	 * expects $args to be an associative array with key => value pairs
	 *
	 */

	/**
	 * Generic set method to add module properties
	 * if a set*PropertyName* method exist, it gets called
	 *
	 * @param $args
	 */
	public function set( $args ) {
		if ( !is_array( $args ) ) {
			_doing_it_wrong( 'set() on block instance', '$args must be an array of key/value pairs', '1.0.0' );

			return false;
		}

		foreach ( $args as $k => $v ) {
			if ( method_exists( $this, 'set' . ucfirst( $k ) ) ) {
				$this->{'set' . ucfirst( $k )}( $v );
			} else {
				$this->$k = $v;
			}
		}

	}

	/**
	 * Extend envVars wirh additional given vars
	 *
	 * @param $vars
	 */
	public function setEnvVars( $vars ) {
		$this->envVars = wp_parse_args( $this->envVars, $vars );
	}

	/**
	 * Set area context of module
	 *
	 * @param $areaContext
	 */
	public function setAreaContext( $areaContext ) {
		$this->areaContext = $areaContext;

	}

	/**
	 * Get area context of module
	 * @return mixed
	 */
	public function getAreaContext() {
		if ( isset( $this->areaContext ) ) {
			return $this->areaContext;
		} else {
			return false;
		}

	}

	/**
	 * If an Environment is given, add from that
	 * and further extend envVars
	 *
	 * @param $environment
	 */
	public function setEnvVarsfromEnvironment( $environment ) {
		$this->envVars = wp_parse_args( $this->envVars,
			array(
				'postType'     => $environment->get( 'postType' ),
				'pageTemplate' => $environment->get( 'pageTemplate' ),
				'postId'       => absint( $environment->get( 'postID' ) ),
				'areaContext'  => $this->getAreaContext(),
				'area'         => $this->area
			) );

	}

	public function getViewfile() {

		if ( isset( $this->viewfile ) ) {
			return $this->viewfile;
		} elseif ( method_exists( $this, 'defaultView' ) ) {
			return $this->defaultView();
		}

	}

	public function assignViewFile($file){
		$this->viewfile = $file;
	}

	public function defaultView() {
		return '';
	}

	public function getView() {
		if ( !class_exists('Kontentblocks\Templating\ModuleTemplate') ){
			class_alias('Kontentblocks\Templating\ModuleView', 'Kontentblocks\Templating\ModuleTemplate' );
		}
		if ( $this->getSetting( 'useViewLoader' ) && is_null( $this->View ) ) {
			$tpl    = $this->getViewfile();
			$Loader = new ModuleViewLoader( $this );
			$T      = new ModuleView( $this );
			$full = $Loader->getTemplateByName( $tpl );
			if ( isset( $full['fragment'] ) ) {
				$T->setTplFile( $full['fragment'] );
				$T->setPath( $full['basedir'] );
			}

			$this->View = $T;

			return $this->View;

		} else if ( $this->View ) {
			return $this->View;
		}

		return null;
	}


	/**
	 * Set the area where this Block is located
	 * TODO: remove, make it useless
	 */
	public function get( $key = null, $return = '' ) {
		_doing_it_wrong( 'get', 'MUST not be used anymore', '1.0.0' );

		return ( !empty( $this->moduleData[ $key ] ) ) ? $this->moduleData[ $key ] : $return;

	}

	/**
	 * Get value from prepared / after field setup / data
	 *
	 * @param string $key
	 * @param string $arrayKey
	 * @param mixed $return
	 *
	 * @return mixed
	 */
	public function getData( $key = null, $arrayKey = null, $return = '' ) {
		if ( empty( $this->moduleData ) or empty( $key ) ) {
			return false;
		}

		if ( !is_null( $arrayKey ) ) {
			return ( !empty( $this->moduleData[ $arrayKey ][ $key ] ) ) ? $this->moduleData[ $arrayKey ][ $key ] : $return;
		}

		return ( !empty( $this->moduleData[ $key ] ) ) ? $this->moduleData[ $key ] : $return;

	}

	/**
	 * Get value from unprepared / unfiltered original module data
	 *
	 * @param string $key
	 * @param string $arrayKey
	 * @param mixed $return
	 *
	 * @TODO arrayKey should be handled differently
	 * @return bool|string
	 */
	public function getRawData( $key = null, $arrayKey = null, $return = '' ) {
		if ( empty( $this->rawModuleData ) or empty( $key ) ) {
			return false;
		}

		if ( !is_null( $arrayKey ) ) {
			return ( !empty( $this->rawModuleData[ $arrayKey ][ $key ] ) ) ? $this->rawModuleData[ $arrayKey ][ $key ] : $return;
		}

		return ( !empty( $this->rawModuleData[ $key ] ) ) ? $this->rawModuleData[ $key ] : $return;

	}

	/**
	 * @TODO Test if in use?
	 *
	 * @param null $key
	 */
	public function getDataObj( $key = null ) {
		$test = $this->Fields->getFieldByKey( $key );

	}

	/**
	 * Get value from environment vars array
	 *
	 * @param $var string
	 *
	 * @since 1.0.0
	 * @return mixed|null
	 */
	public function getEnvVar( $var ) {
		if ( isset( $this->envVars[ $var ] ) ) {
			return $this->envVars[ $var ];
		} else {
			return null;
		}

	}

	/**
	 * Get a single module setting
	 *
	 * @param $var string setting key
	 *
	 * @return mixed|null
	 */
	public function getSetting( $var ) {
		if ( isset( $this->settings[ $var ] ) ) {
			return $this->settings[ $var ];
		} else {
			return null;
		}

	}


	/**
	 * Set Additional data
	 * @since 1.0.0
	 */
	public function setData( $key, $value ) {
		$this->moduleData[ $key ] = $value;

	}

	/**
	 * Absolute path to class
	 * Get's set upon registration
	 * @since 1.0.0
	 * @return string
	 */
	public function getPath() {
		return $this->getSetting( 'path' );

	}

	/**
	 * Get's set upon registration
	 * @since 1.0.0
	 * @return string URI of module
	 */
	public function getUri() {
		return $this->getSetting( 'uri' );

	}

	/**
	 * Check if module has attributes which make it non-public
	 * @since 1.0.0
	 * @return bool
	 */
	public function isPublic() {
		if ( $this->getSetting( 'disabled' ) || $this->getSetting( 'hidden' ) ) {
			return false;
		}

		if ( !$this->state['active'] || $this->state['draft'] ) {
			return false;
		}

		return true;
	}

	public function toJSON() {

		// todo only used on frontend
		$toJSON = array(
			'envVars'     => $this->envVars,
			'settings'    => $this->settings,
			'state'       => $this->state,
			'instance_id' => $this->instance_id,
			'moduleData'  => apply_filters( 'kb_modify_module_data', $this->rawModuleData, $this->settings ),
			'area'        => $this->area,
			'post_id'     => $this->envVars['postId'],
			'areaContext' => $this->areaContext,
			'viewfile'    => $this->getViewfile(),
			'class'       => get_class( $this ),
			'inDynamic'   => AreaRegistry::getInstance()->isDynamic( $this->area ),
			'uri'         => $this->getUri()
		);
		// only for master templates
		if ( isset( $this->master ) && $this->master ) {
			$toJSON['master']    = true;
			$toJSON['master_id'] = $this->master_id;
			$toJSON['post_id']   = $this->master_id;
		}

		return $toJSON;

	}

	/**
	 * Module default settings array
	 * @since 1.0.0
	 * @return array
	 */
	public static function getDefaults() {

		return array(
			'disabled'         => false,
			'publicName'       => 'Module Name Missing',
			'name'             => '',
			'wrap'             => true,
			'wrapperClasses'   => '',
			'description'      => '',
			'connect'          => 'any',
			'hidden'           => false,
			'predefined'       => false,
			'inGlobalSidebars' => false,
			'inGlobalAreas'    => false,
			'asTemplate'       => true,
			'category'         => 'standard',
			'useViewLoader'    => false
		);

	}

	/**
	 * Default State after creation
	 * @since 1.0.0
	 * @return array
	 */
	public static function getDefaultState() {
		return array(
			'active' => true,
			'draft'  => true
		);

	}

	/**
	 * Returns a string indicator for the current status
	 * @since 1.0.0
	 * @return string
	 */
	public function getStatusClass() {
		if ( $this->state['active'] ) {
			return 'activated';
		} else {
			return 'deactivated';
		}

	}

	/**
	 * Add area Attributes to env vars
	 *
	 * @param $args
	 */
	public function _addAreaAttributes( $args ) {
		if ( $this->envVars ) {
			$this->envVars += $args;
		}

	}

	/**
	 * Get public module name
	 * @return mixed
	 * @since 1.0.0
	 */
	public function getModuleName() {
		if ( isset( $this->overrides ) ) {
			return $this->overrides['name'];
		} else {
			return $this->settings['name'];
		}

	}
//
//	public function getTemplateSelector() {
//		return $this->TemplateSelector;
//	}


}
