<?php


namespace Kontentblocks\Fields;

use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;
use Kontentblocks\Fields\Returnobjects;

/**
 * Class Field
 * @package Kontentblocks\Fields
 * @since 1.0.0
 *
 * Note: Three components, one optional, to build the input name attribute
 * 1. baseId, most likely equals a modules id
 * 2. subkey, if fields are grouped resp. nested under one subkey in $POST data(see class FieldSubGroup)
 * 3. key, the actual storage key in the $POST data
 */
abstract class Field
{

    /**
     * Base id/key for the field
     * may get modified if a subkey is present
     * @var string
     * @since 1.0.0
     */
    protected $baseId;

    /**
     * Unique 'named' field id
     * will and should equal the original baseId, without subkey applied
     * @var string
     */
    protected $fieldId;

    /**
     * Unique id generated on run time
     * prim. used on frontend to map data around
     * @var string
     */
    public $uniqueId;


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
    public $value;

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
     * @remove exchange with fieldId
     * @var string module instance_id
     */
    public $parentModuleId;


    /**
     * Constructor
     * @param string $baseId
     * @param null|string $subkey
     * @param string $key unique storage key
     */
    public function __construct( $baseId, $subkey = null, $key )
    {
        if (!isset( $key, $baseId )) {
            throw new \BadMethodCallException( 'Missing arguments for new Field' );
        }
        $this->setKey( $key );
        $this->setBaseId( $baseId, $subkey );
        $this->setFieldId( $baseId );

        $this->type = static::$settings['type'];
        //@TODO think about setting default args from extending class
    }

    /**
     * set storage key
     * @param string $key
     *
     * @since 1.0.0
     */
    private function setKey( $key )
    {
        $this->key = $key;
    }

    /**
     * get storage key
     * @return string
     * @since 1.0.0
     */
    public function getKey()
    {
        return $this->key;

    }

    /**
     * Field parameters array
     *
     * @param array $args
     *
     * @since 1.0.0
     * @return bool
     */
    public function setArgs( $args )
    {
        if (is_array($args) && !empty($args)){
            $this->args = $args;
            return true;
        }

        return false;
    }

    /**
     * base prefix for the field
     * generally based upon the parent module instance id
     * like: module_x_n['$key']
     * optional as array
     *
     * @param $id
     * @param string $subkey
     *
     * @since 1.0.0
     */
    public function setBaseId( $id, $subkey )
    {
        if (!$subkey) {
            $this->baseId = $id;
        } else {
            $this->baseId = $id . '[' . $subkey . ']';
        }
    }

    /**
     * @return string
     */
    public function getBaseId()
    {
        return $this->baseId;
    }


    /**
     * Unique Field id setter
     * @param string $id
     */
    public function setFieldId( $id )
    {
        $this->fieldId = $id;
    }


    /**
     * @return string
     */
    public function getFieldId()
    {
        return $this->fieldId;
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
    public function setData( $data )
    {
        if (method_exists( $this, 'inputFilter' )) {
            $this->value = $this->inputFilter( $data );
        } else {
            $this->value = $data;
        }
    }


    /**
     * Setup method
     *
     * @param mixed $data fields assigned value
     *
     * @since 1.0.0
     */
    public function setup( $data )
    {
        $this->setData( $data );
    }

    /**
     * Get a special object for the field type if field has one set
     * getValue will look for the 'get' callback on the field
     * prepareOutput will look for the 'output' callback on the field
     *
     * getValue runs in different contexts (front and backend), it should be used
     * to modify, sanitize, etc.. the data which is expected from the field
     *
     * prepareOutput runs when data is setup for the frontend output of a module
     * @TODO Kind of Registry for Return Objects
     * @TODO Overall logic is fuxxed up
     * @since 1.0.0
     * @return object
     */
    public function getUserValue()
    {
        $value = $this->prepareOutput( $this->getValue() );
        if ($this->getArg( 'returnObj' )) {
            $classname = $this->getArg( 'returnObj' );

            // backwards compat
            $classname = $this->aliasReturnObjectClass( $classname );

            // first try with FQN
            $classpath = 'Kontentblocks\\Fields\\Returnobjects\\' . $classname;

            if (class_exists( 'Kontentblocks\\Fields\\Returnobjects\\' . $classname, true )) {
                $this->returnObj = new $classpath( $value, $this );
            }

            // second try
            if (class_exists( $classname )) {
                $this->returnObj = new $classname( $value, $this );
            }

            return $this->returnObj;

        } elseif ($this->getSetting( 'returnObj' ) && $this->getArg( 'returnObj' ) !== false) {
            $classpath = 'Kontentblocks\\Fields\\Returnobjects\\' . $this->getSetting( 'returnObj' );
            $this->returnObj = new $classpath( $value, $this );
            return $this->returnObj;
        } else {
//			$this->returnObj = new Returnobjects\DefaultFieldReturn( $this->value );
//			return $this->returnObj;
            return $value;
        }

    }

    /**
     * Prepare output
     * Runs when data is requested by getUserValue
     * which is the recommended method to get frontend data
     * an optional returnObj
     *
     * @param $value
     *
     * @return mixed
     */
    public function prepareOutput( $value )
    {
        // custom method on field instance level wins over class method
        if ($this->getCallback( 'output' )) {
            return call_user_func( $this->getCallback( 'output' ), $value );
        } // custom method on field class level
        else {
            return $this->prepareOutputValue( $value );
        }
    }

    /**
     * Default output, whenever data is requested for the user facing side
     *
     * @param $val
     *
     * @return mixed
     */
    public function prepareOutputValue( $val )
    {
        return $val;
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
     * @return void
     */
    public function build()
    {

        $this->uniqueId = $this->createUID();

        // handles the form output
        $FormNode = new FieldFormHtmlNode( $this );
        $FormNode->build();

    }

    /**
     * Before the value arrives the fields form
     * Each field must implement this method
     *
     * @param $val
     *
     * @return mixed
     */
    abstract public function prepareFormValue( $val );

    /**
     * JSON Encode custom settings for the field
     * @since 1.0.0
     */
    public function javascriptSettings()
    {

        JSONBridge::getInstance()->registerFieldArgs( $this->uniqueId, $this->cleanedArgs() );

        $settings = $this->getArg( 'jSettings' );
        if (!$settings) {
            return;
        }
        JSONBridge::getInstance()->registerData( 'FieldsConfig', $this->uniqueId, $settings );

    }


    /**
     * Helper Method to create a complete label tag
     * @since 1.0.0
     */
    protected function label()
    {
        $label = $this->getArg( 'label' );
        if (!empty( $label )) {
            echo "<label class='kb_label heading kb-field--label-heading' for='{$this->getInputFieldId(
            )}'>{$this->getArg(
                'label'
            )}</label>";
        }

    }

    /**
     * Getter for field data
     * Will call filter() if available
     * @TODO this method is used on several occasions
     *
     * @param string $arrKey
     * @param string $return
     * @return mixed|null returns null if data does not exist
     */
    public function getValue( $arrKey = null, $return = '' )
    {
        $data = null;

        if ($arrKey && is_array( $this->value ) && isset( $this->value[$arrKey] )) {
            $data = $this->value[$arrKey];
        } else {
            $data = $this->value;
        }

        if ($this->getCallback( 'get' )) {
            $data = call_user_func( $this->getCallback( 'get' ), $this->value );
        }

        if (is_null( $data )) {
            $data = $return;
        }

        return $data;
    }


    /**
     * Renders description markup
     * Get description if available
     * @since 1.0.0
     */
    protected function description()
    {
        $description = $this->getArg( 'description' );
        if (!empty( $description )) {
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
    public function _save( $keydata, $oldKeyData = null )
    {
        $data = $this->save( $keydata, $oldKeyData );
        if ($this->getCallback( 'save' )) {
            $data = call_user_func( $this->getCallback( 'save' ), $keydata, $oldKeyData, $data );
        }

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
    public function save( $keydata, $oldKeyData )
    {
        if (is_null( $keydata )) {
            return null;
        } else {
            return $keydata;
        }

    }


    /**
     * @param $module
     */
    public function setModule( $module )
    {
        $this->module = $module;
    }


    /**
     * Get a setting var from (late bound) static settings array
     *
     * @param $key
     *
     * @return bool|mixed
     */
    public function getSetting( $key )
    {

        if (isset( static::$settings[$key] )) {
            return static::$settings[$key];
        } else {
            return null;
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
    public function getArg( $arg, $default = false )
    {
        if (isset( $this->args[$arg] )) {
            return $this->args[$arg];
        } else {
            return $default;
        }

    }

    /**
     * Get callback from callbacks arg
     * @param $type
     *
     * @return null
     */
    public function getCallback( $type )
    {
        $allowed = array( 'output', 'input', 'get', 'save' );

        if (!in_array( $type, $allowed )) {
            return null;
        }

        $callbacks = $this->getArg( 'callbacks' );

        if ($callbacks) {
            if (isset( $callbacks[$type] ) && is_callable( $callbacks[$type] )) {
                return $callbacks[$type];
            }
        }
        return null;
    }

    /**
     * Get condition from condition arg
     * @param string $type
     *
     * @return null
     */
    public function getCondition( $type )
    {
        $conditions = $this->getArg( 'conditions' );
        if ($conditions) {
//            if (isset($conditions[$type]) && is_string($conditions[$type])){
            if (isset( $conditions[$type] )) {
                return $conditions[$type];
            }
        }
        return false;
    }

    /**
     * Mainly used internally to specifiy the fields visibility
     * @return bool
     */
    public function getDisplay()
    {
        return filter_var( $this->args['display'], FILTER_VALIDATE_BOOLEAN );

    }

    /**
     * Set fields visibility
     *
     * @param $bool
     */
    public function setDisplay( $bool )
    {
        $this->args['display'] = $bool;

    }

    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * @param bool $rnd
     * @return string|void
     */
    protected function getInputFieldId( $rnd = false )
    {
        $number = ( $rnd ) ? uniqid() : '';
        $idAttr = sanitize_title( $this->baseId . '_' . $this->key . '_' . $number );
        return esc_attr( $idAttr );
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
     * @return string
     */
    public function getFieldName( $array = null, $akey = null, $multiple = null )
    {

        $base = $this->getBaseId() . '[' . $this->getKey() . ']';
        $array = $this->evaluateFieldNameParam( $array );
        $akey = $this->evaluateFieldNameParam( $akey );
        $multiple = $this->evaluateFieldNameParam( $multiple );

        return esc_attr( $base  . $array . $akey . $multiple );


    }

    private function evaluateFieldNameParam( $param )
    {
        if (is_bool( $param ) && $param === true) {
            return '[]';
        }

        if (is_string( $param ) && !empty( $param )) {
            return "[$param]";
        }

        return '';
    }

    /**
     * Shortcut method to placeholder arg
     * @return string|void
     */
    protected function getPlaceholder()
    {
        return esc_attr( $this->getArg( 'placeholder' ) );

    }

    /**
     * Prepare Args for JSON
     * @TODO hacky
     */
    private function cleanedArgs()
    {
        if (method_exists( $this, 'argsToJson' )) {
            return $this->argsToJson();
        } else {
            $args = $this->args;
            unset( $args['callbacks'] );
            return $args;
        }
    }

    private function aliasReturnObjectClass( $classname )
    {
        switch ($classname) {

            case 'Element':
                return 'EditableElement';
                break;

            case 'Image':
                return 'EditableImage';
                break;
        }

        return $classname;
    }

    public function createUID()
    {
        $base = $this->baseId . $this->key;
        return 'kb-' . hash( 'crc32', $base );
    }

}
