<?php


namespace Kontentblocks\Fields;

use Kontentblocks\Common\Exportable;
use Kontentblocks\Fields\Definitions\ReturnObjects\StandardFieldReturn;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Customizer\CustomizerIntegration;
use Kontentblocks\Templating\FieldView;
use Kontentblocks\Fields\Returnobjects;

/**
 * Class Field
 * @package Kontentblocks\Fields
 * @since 0.1.0
 *
 * Note: Three components, one optional, to build the input name attribute
 * 1. baseId, most likely equals a modules id
 * 2. subkey, if fields are grouped resp. nested under one subkey in $POST data(see class FieldSubGroup)
 * 3. key, the actual storage key in the $POST data
 */
abstract class Field implements Exportable
{

    /**
     * Unique id generated on run time
     * prim. used on frontend to map data around
     * @var string
     */
    public $uniqueId;
    /**
     * Actual data for field
     * @var mixed
     * @since 0.1.0
     */
    public $value;
    /**
     * @var AbstractFieldSection
     */
    public $section;


    /**
     * @var FieldModel
     */
    public $model;
    public $objectId = 0;
    /**
     * Current field type
     * @var string
     * @since 0.1.0
     */
    public $type;
    /**
     * Base id/key for the field
     * may get modified if a subkey is present
     * @var string
     * @since 0.1.0
     */
    protected $baseId;
    /**
     * Unique 'named' field id
     * will and should equal the original baseId, without subkey applied
     * @var string
     */
    protected $fieldId;
    /**
     * @var array additional arguments
     * @since 0.1.0
     */
    protected $args;
    /**
     * key
     * @var string
     * @since 0.1.0
     */
    protected $key;
    /**
     * @var mixed
     */
    protected $userValue;


    /**
     * Return Object
     * @var \Kontentblocks\Fields\InterfaceFieldReturn
     * @TODO Concept is WIP
     *
     */
    private $returnObj;

    /**
     * Constructor
     * @param string $baseId
     * @param null|string $subkey
     * @param string $key unique storage key
     * @param $args
     */
    public function __construct( $baseId, $subkey = null, $key, $args )
    {
        $this->key = $key;
        $this->fieldId = $baseId;
        $this->setBaseId( $baseId, $subkey );
        $this->type = static::$settings['type'];
        $this->setArgs( $args );
        $this->prepare();
    }

    /* ---------------------------------------------
     * Common Methods
     * ---------------------------------------------
     */

    public function prepare(){
        // nothing to do if not overridden
    }

    /**
     * Field parameters array
     * @param array $args
     * @since 0.1.0
     * @return bool
     */
    public function setArgs( $args )
    {
        if (is_array( $args ) && !empty( $args )) {
            $this->args = wp_parse_args( $args, $this->args );
            return true;
        }

        return false;
    }

    /**
     * @return string
     */
    public function getFieldId()
    {
        return $this->fieldId;
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
            if (isset( $conditions[$type] )) {
                return $conditions[$type];
            }
        }
        return false;
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
     * Mainly used internally to specifiy the fields visibility
     * @return bool
     */
    public function getDisplay()
    {
        return filter_var( $this->getArg( 'display', true ), FILTER_VALIDATE_BOOLEAN );

    }

    /**
     * Set fields visibility
     *
     * @param $bool
     * @return bool
     */
    public function setDisplay( $bool )
    {
        $this->setArgs( array( 'display' => filter_var( $bool, FILTER_VALIDATE_BOOLEAN ) ) );
        return $bool;
    }

    public function setData( $data )
    {
        $data = $this->setValue( $data );

//        if (is_null( $this->model )) {
//            $this->model = new FieldModel( $data, $this );
//        } else {
//            $this->model->set( $data );
//        }
//        $this->value = $this->model->export();
        $this->value = $data;

    }

    /**
     * The actual output method for the field markup
     * Any markup should be returned
     * Can be overridden by the individual field class
     * @since 0.1.0
     * @param FieldFormController $formController
     * @return bool
     */
    public function form( FieldFormController $formController )
    {
        $type = $this->type;
        $tpl = $this->getArg( 'template', 'default' );
        $data = array(
            'Form' => $formController,
            'Field' => $this,
            'value' => $this->getValue(),
            'i18n' => I18n::getPackages( 'Refields.common', "Refields.{$type}" )
        );

        /**
         * Field may alter the injected data array
         */
        $data = $this->prepareTemplateData( $data );

        if ($this->getCallback( 'template.data' )) {
            $data = call_user_func( $this->getCallback( 'template.data' ), $data );
        }

        $View = new FieldView(
            $type . '/' . $tpl . '.twig', $data
        );
        return $View->render( false );
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
        $data = $this->value;

        if ($this->getCallback( 'get.value' )) {
            $data = call_user_func( $this->getCallback( 'get.value' ), $data );
        }

        if (is_null( $arrKey ) && !is_null( $data )) {
            return $data;
        }

        if (!is_null( $arrKey ) && is_array( $data ) && isset( $data[$arrKey] )) {
            return $data[$arrKey];
        }


        return $this->getArg( 'std', $return );
    }

    /**
     * Set field data
     * Data from _POST[{baseid}[$this->key]]
     * Runs each time when data is set to the field
     * Frontend/Backend
     *
     * @param mixed $data
     *
     * @since 0.1.0
     * @return mixed
     */
    public function setValue( $data )
    {
        return $data;
    }

    /**
     * Get callback from callbacks arg
     * @param $type
     *
     * @return null
     */
    public function getCallback( $type )
    {
        $allowed = array( 'template.data', 'frontend.value', 'form.value', 'get.value', 'save.value' );

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
     *
     * @param array $data
     * @return array
     */
    protected function prepareTemplateData( $data )
    {
        return $data;
    }

    /**
     * Build the whole field, including surrounding wrapper
     * and optional 'hooks"
     * @since 0.1.0
     * @param bool $echo
     * @return string $out
     */
    public function build( $echo = true )
    {
        $this->uniqueId = $this->createUID();
        // handles the form output
        $formController = new FieldFormController( $this );
        $out = $formController->build();

        if ($echo) {
            echo $out;
        }

        return $out;
    }

    public function createUID()
    {

        $state = 'frontend';

        if (defined( 'KB_MODULE_FORM' ) && KB_MODULE_FORM) {
            $state = 'from';
        }

        if (is_null( $this->uniqueId )) {
            $base = $this->baseId . $this->key . $state . $this->getArg( 'index', '' ) . $this->getArg(
                    'arrayKey',
                    ''
                );
            $this->uniqueId = 'kb-' . hash( 'crc32', $base );
        }
        return $this->uniqueId;
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
     * @since 0.1.0
     */
    public function toJson()
    {
        $args = $this->cleanedArgs();
        Kontentblocks::getService( 'utility.jsontransport' )->registerFieldArgs(
            $this->uniqueId,
            $this->augmentArgs( $args )
        );
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

    public function augmentArgs( $args )
    {
        $def = array();
        $def['uid'] = $this->createUID();
        $def['type'] = $this->type;
        $def['baseId'] = $this->getBaseId();
        $def['fieldId'] = $this->fieldId;
        $def['fieldkey'] = $this->getKey();
        $def['arrayKey'] = $this->getArg( 'arrayKey', null );
        $def['kpath'] = $this->createKPath();

        return wp_parse_args( $args, $def );
    }

    /**
     * @return string
     */
    public function getBaseId()
    {
        return $this->baseId;
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
     * @since 0.1.0
     */
    public function setBaseId( $id, $subkey = null )
    {
        if (!$subkey) {
            $this->baseId = $id;
        } else {
            $this->baseId = $id . '[' . $subkey . ']';
        }
    }

    /**
     * get storage key
     * @return string
     * @since 0.1.0
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * create the key for the value in dot notation
     * used by js code to lookup data from entityData
     * @return string
     */
    private function createKPath()
    {
        $path = '';
        if ($this->getArg( 'arrayKey', false )) {
            $path .= $this->getArg( 'arrayKey' ) . '.';
        }

        if ($this->getArg( 'index', false )) {
            $path .= $this->getArg( 'index' ) . '.';
        }

        $path .= $this->getKey();
        return $path;
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
        if ($this->getCallback( 'save.value' )) {
            $data = call_user_func( $this->getCallback( 'save.value' ), $keydata, $oldKeyData, $data );
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

    public function export( &$collection )
    {
        $concatKey = ( $this->getArg( 'arrayKey' ) ) ? $this->getArg( 'arrayKey' ) . '.' . $this->getKey(
            ) : $this->getKey();

        $notated = ( $this->getArg( 'arrayKey' ) ) ? '[' . $this->getArg( 'arrayKey' ) . '][' . $this->getKey(
            ) . ']' : $this->getKey();

        $collection[$notated] = array(
            'key' => $this->getKey(),
            'arrayKey' => $this->getArg( 'arrayKey' ),
            'arrayPath' => $concatKey,
            'kpath' => $notated,
            'type' => $this->type,
            'std' => $this->getArg( 'std', '' ),
            'args' => $this->cleanedArgs(),
            'section' => $this->section->sectionId,
            'data' => $this->getFrontendValue()
        );
    }

    /**
     * Get a special object for the field type if field has one set
     * getValue will look for the 'get' callback on the field
     * prepareFrontend will look for the 'output' callback on the field
     *
     * getValue runs in different contexts (front and backend), it should be used
     * to modify, sanitize, etc.. the data which is expected from the field
     *
     * prepareFrontend runs when data is setup for the frontend output of a module
     * @since 0.1.0
     * @param null $salt
     * @return object
     * @throws \Exception
     */
    public function getFrontendValue( $salt = null )
    {

        if (!is_null( $this->userValue )) {
            return $this->userValue;
        }


        $value = $this->prepareFrontend( $this->getValue() );
        if ($this->getArg( 'returnObj' )) {
            $classname = $this->getArg( 'returnObj' );
            // backwards compat
            $classname = $this->aliasReturnObjectClass( $classname );

            // first try with FQN
            $classpath = 'Kontentblocks\\Fields\\Definitions\\ReturnObjects\\' . $classname;
            if (class_exists( 'Kontentblocks\\Fields\\Definitions\\ReturnObjects\\' . $classname, true )) {
                $this->returnObj = new $classpath( $value, $this, $salt );
            }
            $classpath2 = 'Kontentblocks\\Fields\\Returnobjects\\' . $classname;
            if (class_exists( 'Kontentblocks\\Fields\\Returnobjects\\' . $classname, true )) {
                $this->returnObj = new $classpath2( $value, $this, $salt );
            }
            // second try
            if (class_exists( $classname )) {
                $this->returnObj = new $classname( $value, $this, $salt );
            }

            if (is_null( $this->returnObj )) {
                throw new \Exception( 'requested Return Object does not exist' );
            }

            $this->userValue = $this->returnObj;
            return $this->userValue;

        } elseif ($this->getSetting( 'returnObj' ) && $this->getArg( 'returnObj', null ) !== false) {
            $classpath = 'Kontentblocks\\Fields\\Definitions\\ReturnObjects\\' . $this->getSetting( 'returnObj' );
            $this->returnObj = new $classpath( $value, $this, $salt );
            $this->userValue = $this->returnObj;
            return $this->userValue;
        } else {
            $this->returnObj = new StandardFieldReturn( $value, $this, $salt );
            $this->userValue = $this->returnObj;
            return $this->userValue;
        }
    }

    /**
     * Prepare output
     * Runs when data is requested by getFrontendValue
     * which is the recommended method to get frontend data
     * an optional returnObj
     *
     * @param $value
     *
     * @return mixed
     */
    private function prepareFrontend( $value )
    {
        // custom method on field instance level wins over class method
        if ($this->getCallback( 'frontend.value' )) {
            return call_user_func( $this->getCallback( 'frontend.value' ), $value );
        } // custom method on field class level
        else {
            return $this->prepareFrontendValue( $value );
        }
    }

    /**
     * Default output, whenever data is requested for the user facing side
     *
     * @param $val
     *
     * @return mixed
     */
    public function prepareFrontendValue( $val )
    {
        return $val;
    }

    /**
     * For backwards compat reasons
     * @param $classname
     * @return string
     */
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
     * @param \WP_Customize_Manager $customizeManager
     * @param CustomizerIntegration $integration
     * @return null
     */
    public function addCustomizerControl( \WP_Customize_Manager $customizeManager, CustomizerIntegration $integration )
    {
        $customizeManager->add_control(
            $integration->getSettingName( $this ),
            array(
                'label' => $this->getArg( 'label' ),
                'section' => $this->section->getSectionId(),
                'type' => $this->type
            )
        );
    }
}
