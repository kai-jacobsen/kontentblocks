<?php


namespace Kontentblocks\Fields;

use Kontentblocks\Backend\Environment\Save\ConcatContent;
use Kontentblocks\Utils\JSONBridge;

/**
 * Class Field
 * @package Kontentblocks\Fields
 * @since 1.0.0
 */
abstract class Field {

	/**
	 * Base id/key for the field
	 * @var string
	 * @since 1.0.0
	 */
	protected $baseId;

	/**
	 * Shared/common arguments are
	 * - label string
	 * - description string
	 * - areaContext array of contexts
	 * @TODO What else
	 * @var array additional arguments
	 * @since 1.0.0
	 */
	protected $args;

	/**
	 * Actual data for field
	 * @var mixed
	 * @since 1.0.0
	 */
	protected $value;

	/**
	 * key
	 * @var string
	 * @since 1.0.0
	 */
	protected $key;

	/**
	 * Current field type
	 * @var string
	 * @since 1.0.0
	 */
	protected $type;

	/**
	 * Path to field definition
	 * @var string
	 * @TODO really?
	 * @since 1.0.0
	 */
	protected $path;

	/**
	 * Return Object
	 * @var \Kontentblocks\Interfaces\InterfaceFieldReturn
	 * @TODO Concept is WIP
	 *
	 */
	public $returnObj;

	/**
	 * @var \Kontentblocks\Modules\Module
	 */
	protected $module;

	/**
	 * @var string module instance_id
	 */
	public $parentModuleId;

	/**
	 * set storage key
	 *
	 * @param string $key
	 *
	 * @since 1.0.0
	 */
	public function setKey( $key ) {
		$this->key = $key;
	}

	/**
	 * get storage key
	 * @return string
	 * @since 1.0.0
	 */
	public function getKey() {
		return $this->key;

	}

	/**
	 * Field parameters array
	 *
	 * @param array $args
	 *
	 * @since 1.0.0
	 */
	public function setArgs( $args ) {
		$this->args = $args;

	}

	/**
	 * base prefix for the field
	 * generally based upon the parent module instance id
	 * like: module_x_n['$key']
	 * optional as array
	 *
	 * @param $id
	 * @param bool $array
	 *
	 * @since 1.0.0
	 */
	public function setBaseId( $id, $array = false ) {
		if ( ! $array ) {
			$this->baseId = $id;
		} else {
			$this->baseId = $id . '[' . $array . ']';
		}
		// set parent module id which equals given id
		$this->parentModuleId = $id;

	}


	public function getBaseId() {
		return $this->parentModuleId;
	}

	/**
	 * Set field data
	 * Data from _POST[{baseid}[$this->key]]
	 * Runs each time when data is set to the field
	 * Frontend/Backend
	 *
	 * @param mixed $data
	 *
	 * @since 1.0.0
	 */
	public function setData( $data ) {
		$this->value = $this->sanitize( $data );
	}

	/**
	 * Type of field as set upon field registration
	 * like: 'text', 'checkbox' etc..
	 *
	 * @param string $type
	 *
	 * @since 1.0.0
	 */
	public function setType( $type ) {
		$this->type = $type;

	}

	/**
	 * Setup method
	 *
	 * @param mixed $data fields assigned value
	 * @param string $moduleId
	 *
	 * @TODO Investigate the difference between parentModule and parentModuleId, set above
	 * @since 1.0.0
	 */
	public function setup( $data, $moduleId ) {
		$this->parentModuleId = $moduleId;
		$this->setData( $data );
	}

	/**
	 * Get a special object for the field type if field has one set
	 * @TODO Kind of Registry for Return Objects
	 * @TODO Overall logic is fuxxed up
	 * @since 1.0.0
	 * @return object
	 */
		public function getReturnObj() {

			if (is_object($this->returnObj)){
				return $this->returnObj;
			}

		if ( ! $this->returnObj && $this->getArg( 'returnObj' ) ) {
			$classname = $this->getArg( 'returnObj' );


			// first try
			$classpath = 'Kontentblocks\\Fields\\Returnobjects\\' . $classname;
			if ( class_exists( 'Kontentblocks\\Fields\\Returnobjects\\' . $classname, true ) ) {
				$this->returnObj = new $classpath( $this->value, $this );
			}

			// second try
			if ( class_exists( $classname ) ) {
				$this->returnObj = new $classname( $this->value, $this );
			}

			return $this->returnObj;
		} else {

//			$this->returnObj = new Returnobjects\DefaultFieldReturn( $this->value );
//			return $this->returnObj;
			return $this->value;
		}

	}

	/**
	 * The actual output method for the field markup
	 * Any markup should be echoed, not returned
	 * Must be overridden by the individual field class
	 * @since 1.0.0
	 * @return void
	 */
	public abstract function form();

	/**
	 * Build the whole field, including surrounding wrapper
	 * and optional 'hooks"
	 * @TODO add some wp hooks here?
	 * @since 1.0.0
	 * @return bool
	 */
	public function build() {
		// nobody knows
		$this->uniqueId = uniqid();

		// optional call to simplify enqueueing
		if ( method_exists( $this, 'enqueue' ) ) {
			$this->enqueue();
		}

		// A Field might not be present, i.e. if it's not set to
		// the current context
		// Checkboxes are an actual use case, checked boxes will render hidden to preserve the value during save
		if ( ! $this->getDisplay() ) {
			if ( $this->getDefault( 'renderHidden' ) ) {
				$this->renderHidden();
			} else {
				return false;
			}
			// Full markup
		} else {
			$this->header();
			$this->body();
			$this->footer();
		}

	}

	/**
	 * Header wrap markup
	 * @TODO Let twig kick in
	 * @since 1.0.0
	 */
	public function header() {

		echo '<div class="kb-field-wrapper kb-js-field-identifier" id=' . $this->uniqueId . '>'
		     . '<div class="kb-field-header">';
		if ( ! empty( $this->args['title'] ) ) {
			echo "<h4>{$this->args['title']} --</h4>";
		}
		echo '</div>';
		echo "<div class='kb_field kb-field kb-field--{$this->type} kb-field--reset clearfix'>";

	}

	/**
	 * Field body markup
	 * This method calls the actual form() method.
	 * @since 1.0.0
	 */
	public function body() {
		/*
		 * optional method to render something before the field
		 * @TODO replace with wp hook
		 */
		if ( method_exists( $this, 'preForm' ) ) {
			$this->preForm();
		}

		// When viewing from the frontend, an optional method can be user for the output
		if ( defined( 'KB_ONSITE_ACTIVE' ) && KB_ONSITE_ACTIVE && method_exists( $this, 'frontsideForm' ) ) {
			$this->frontsideForm();
		} else {
			$this->form();
		}

		// some fields (colorpicker etc) might have some individual settings
		$this->javascriptSettings();
		/*
		 * optional call after the body
		 * @TODO replace with wp hook
		 */
		if ( method_exists( $this, 'postForm' ) ) {
			$this->postForm();
		}

	}

	/**
	 * JSON Encode custom settings for the field
	 * @TODO use JSONTransport
	 * @since 1.0.0
	 */
	public function javascriptSettings() {
		JSONBridge::getInstance()->registerData( 'Fields', $this->uniqueId, $this->cleanedArgs() );

		$settings = $this->getArg( 'jSettings' );
		if ( ! $settings ) {
			return;
		}
		JSONBridge::getInstance()->registerData( 'FieldsConfig', $this->uniqueId, $settings );
//        printf('<script>var KB = KB || {}; KB.FieldConfig = KB.FieldConfig || {}; KB.FieldConfig["%s"] = %s;</script>', $this->uniqueId, json_encode($settings));

	}

	/**
	 * Footer
	 * @todo add wp hook
	 * @since 1.0.0
	 */
	public function footer() {
		echo "</div></div>";

	}

	/**
	 * Helper Method to create a complete label tag
	 * @since 1.0.0
	 */
	public function label() {
		$label = $this->getArg( 'label' );
		if ( ! empty( $label ) ) {
			echo "<label class='kb_label heading kb-field--label-heading' for='{$this->getFieldId()}'>{$this->getArg( 'label' )}</label>";
		}

	}

	/**
	 * Getter for field data
	 * Will call filter() if available
	 * @TODO this method is used on several occasions
	 * @TODO its pointless to run filter over and over again, actually the whole filter is pointless
	 * @param string $arrKey
	 *
	 * @return mixed|null returns null if data does not exist
	 */
	public function getValue( $arrKey = null ) {
		if ( $arrKey ) {
			$data =  $this->getValueFromArray( $arrKey );
			if ( $this->getArg( 'getCallback' ) ) {
				$data = call_user_func( $this->getArg( 'getCallback' ), $this->value );
			}
			return $data;
		}

		if ( method_exists( $this, 'inputFilter' ) ) {
			$data = $this->inputFilter( $this->value );

			if ( $this->getArg( 'getCallback' ) ) {
				$data = call_user_func( $this->getArg( 'getCallback' ), $this->value );
			}

			return $data;
		}

		return $this->value;

	}

	/**
	 * If field stores data in an associative array
	 *
	 * @param string $arrKey
	 *
	 * @return mixed|null returns null if key does not exist
	 * @since 1.0.0
	 */
	public function getValueFromArray( $arrKey ) {
		if ( is_array( $this->value ) && isset( $this->value[ $arrKey ] ) ) {
			if ( \method_exists( $this, 'inputFilter' ) ) {
				return $this->inputFilter( $this->value[ $arrKey ] );
			} else {
				return $this->value[ $arrKey ];
			}
		} else {
			return null;
		}

	}

	/**
	 * Whenever setData got called, this runs
	 * (upon field initialization, data fom _POSt or database set to field)
	 * @param $value
	 *
	 * @return mixed
	 */
	public function sanitize( $value ) {
		if ( method_exists( $this, 'outputFilter' ) ) {
			return $this->outputFilter( $value );
		} else {
			return $value;
		}
	}


	/**
	 * Handles the generation of hidden input fields with the correct data
	 * @return bool false if there is no data to render
	 * @since 1.0.0
	 */
	public function renderHidden() {
		$value = $this->getValue();
		if ( empty( $value ) ) {
			return false;
		}

		if ( is_array( $this->getValue() ) ) {
			$is_assoc = \Kontentblocks\Helper\is_assoc_array( $this->getValue() );

			if ( ! $is_assoc ) {
				foreach ( $this->getValue() as $item ) {

					if ( is_array( $item ) && \Kontentblocks\Helper\is_assoc_array( $item ) ) {
						foreach ( $item as $ikey => $ival ) {
							echo "<input type='hidden' name='{$this->getFieldName( true,
								$ikey,
								true )}' value='{$ival}' >";
						}
					} else {
						echo "<input type='hidden' name='{$this->getFieldName( true )}' value='{$item}' >";
					}
				}
			} else {
				foreach ( $this->value as $k => $v ) {
					echo "<input type='hidden' name='{$this->getFieldName( true, $k )}' value='{$v}' >";
				}
			}
		} else {
			echo "<input type='hidden' name='{$this->getFieldName()}' value='{$this->getValue()}' >";
		}
	}

	/**
	 * Renders description markup
	 * Get description if available
	 * @since 1.0.0
	 */
	public function description() {
		$description = $this->getArg( 'description' );
		if ( ! empty( $description ) ) {
			echo "<p class='description kb-field--description'>{$this->getArg( 'description' )}</p>";
		}

	}

	/**
	 * Wrapper to the actual save method
	 *
	 * @param mixed $keydata
	 * @param mixed|null $oldKeyData
	 *
	 * @return mixed
	 */
	public function _save( $keydata, $oldKeyData = null ) {
		$data = $this->save( $keydata, $oldKeyData );

		if ( $this->getArg( 'saveCallback' ) ) {
			$data = call_user_func( $this->getArg( 'saveCallback' ), $keydata, $oldKeyData, $data );
		}

		$this->handleConcatContent( $data );

		return $data;

	}

	/**
	 * Fields saving method
	 *
	 * @param mixed $keydata
	 * @param mixed $oldKeyData
	 *
	 * @return mixed
	 */
	public function save( $keydata, $oldKeyData ) {
		if ( is_null( $keydata ) ) {
			return null;
		} else {
			return $keydata;
		}

	}


	public function handleConcatContent( $data ) {
		// if module is not supposed to have public data, don't concat
		if ( ! method_exists( $this->module, 'isPublic' ) || ! $this->module->isPublic() ) {
			return false;
		}

		// if field is not set to concat, bail out
		if ( ! $this->getArg( 'concat' ) ) {
			return false;
		}

		// Field might modify the concat string before it gets added
		if ( method_exists( $this, 'concat' ) ) {
			return ConcatContent::getInstance()->addString( $this->concat( $data ) );
		}

		// add the plain data to officer Con Tencat
		return ConcatContent::getInstance()->addString( $data );

	}

	public function setModule( $module ) {
		$this->module = $module;
	}


	public function getDefault( $key ) {

		if ( isset( static::$defaults[ $key ] ) ) {
			return static::$defaults[ $key ];
		} else {
			return false;
		}

	}

	/**
	 * Wrapper method to get a single arg from the args array
	 *
	 * @param string $arg argument to retrieve
	 * @param mixed $default return value if arg is not set
	 *
	 * @return mixed arg value
	 */
	public function getArg( $arg, $default = false ) {
		if ( isset( $this->args[ $arg ] ) ) {
			return $this->args[ $arg ];
		} else {
			return $default;
		}

	}

	/**
	 * Mainly used internally to specifiy the fields visibility
	 * @return bool
	 */
	public function getDisplay() {
		return $this->args['display'];

	}

	/**
	 * Set fields visibility
	 *
	 * @param $bool
	 */
	public function setDisplay( $bool ) {
		$this->args['display'] = $bool;

	}

	/**
	 * Helper to generate a unique id to be used with labels and inputs, basically.
	 * */
	public function getFieldId( $rnd = false ) {
		if ( $rnd ) {
			if ( is_bool( $rnd ) ) {
				$number = uniqid( 'kbf' );
			} else {
				$number = $rnd;
			}
			$id = sanitize_title( $this->baseId . '_' . $this->key . '_' . $number );
		} else {
			$id = sanitize_title( $this->baseId . '_' . $this->key );
		}

		return $id;

	}

	/**
	 * Helper to generate input names and connect them to the current module
	 * This method has options to generate a name, name[] or name['key'] and probably some
	 * more hidden possibilities :)
	 *
	 * @param bool $array - if true add [] to the key
	 * @param bool $akey - if true add ['$akey'] to the key
	 * @param bool $multiple
	 *
	 * @internal param string $key - base key for the input field
	 * @return string
	 */
	public function getFieldName( $array = false, $akey = null, $multiple = false ) {
		if ( $array === true && $akey !== null && $multiple ) {
			return "{$this->baseId}[{$this->key}][{$akey}][]";
		} elseif ( $array === true && $akey !== null ) {
			return "{$this->baseId}[{$this->key}][{$akey}]";
		} else if ( is_bool( $array ) && $array === true ) {
			return "{$this->baseId}[{$this->key}][]";
		} else if ( is_string( $array ) && is_string( $akey ) && $multiple ) {
			return "{$this->baseId}[{$this->key}][$array][$akey][]";
		} else if ( is_string( $array ) && is_string( $akey ) ) {
			return "{$this->baseId}[{$this->key}][$array][$akey]";
		} else if ( is_string( $array ) ) {
			return "{$this->baseId}[{$this->key}][$array]";
		} else {
			return "{$this->baseId}[{$this->key}]";
		}

	}

	public function getPlaceholder() {
		return $this->getArg( 'placeholder' );

	}

	/**
	 * Prepare Args for JSON
	 * @TODO hacky
	 */
	private function cleanedArgs() {
		if ( method_exists( $this, 'argsToJson' ) ) {
			return $this->argsToJson();
		} else {
			return $this->args;
		}
	}

}
