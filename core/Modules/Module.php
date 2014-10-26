<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Fields\FieldManager;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Templating\ModuleTemplate;
use Kontentblocks\Templating\ModuleView;


/**
 * Class Module
 * @package Kontentblocks\Modules
 */
abstract class Module
{


    /**
     * If ViewLoader is used, holds the twig template file name
     * @var string
     */
    public $viewfile;

    /**
     * Indicates if this module is a master module
     * @var bool
     */
    public $master;

    /**
     * in case of a template, it's the id of the template post object
     * @var int
     */
    public $parentId;

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

    /**
     * @var \Kontentblocks\Modules\ModuleModel
     */
    public $Model;

    /**
     * @var \Kontentblocks\Templating\ModuleView
     */
    protected $View;

    /**
     * @var \Kontentblocks\Modules\ModuleViewLoader
     */
    protected $ViewLoader;

    /**
     * @var array hold informations about the draft|active state
     */
    public $state;

    /**
     * @var string
     */
    public $instance_id;

    /**
     * @var string
     */
    public $mid;

    /**
     * Constructor
     *
     * @param null $args
     * @param array $data
     * @param PostEnvironment $Environment
     *
     * @internal param string $id identifier
     * @internal param string $name default name, can be individual overwritten
     * @internal param array $block_settings
     */
    function __construct( $args = null, $data = array(), PostEnvironment $Environment = null )
    {
        // batch setup
        $this->set( $args );

        $this->setModuleData( $data );

        $this->setEnvVarsFromEnvironment( $Environment );

        if (method_exists( $this, 'fields' )) {
            $this->Fields = new FieldManager( $this );
            $this->fields();

        }


    }

    /**
     * @param array $data
     */
    public function setModuleData( $data = array() )
    {
        $this->moduleData = $data;
        $this->rawModuleData = $data;
        $this->Model = new ModuleModel( $data );
    }

    /**
     * @return ModuleModel
     */
    public function getModel()
    {
        return $this->Model;
    }

    /**
     * @param string $area
     */
    public function setArea($area)
    {
        $this->setEnvVars(array('area' => $area));
    }

    /**
     * @return string|false
     */
    public function getArea(){
        return $this->getEnvVar('area', false);
    }

    /**
     * options()
     * Method for the backend display
     * gets called by ui display callback
     *
     */
    public function options()
    {
        if (filter_var( $this->getSetting( 'useViewLoader' ), FILTER_VALIDATE_BOOLEAN )) {
            $this->ViewLoader = Kontentblocks::getService( 'registry.moduleViews' )->getViewLoader( $this );
            // render view select field
            echo $this->ViewLoader->render();
        }

        // render fields if set
        if (isset( $this->Fields ) && is_object( $this->Fields )) {
            $this->Fields->renderFields();
        } else {
            $this->renderEmptyOptions();
        }

        return false;
    }

    /**
     * save()
     * Method to save whatever form fields are in the options() method
     * Gets called by the meta box save callback
     *
     * @param array $data actual $_POST data for this module
     * @param array $old previous data or empty
     *
     * @return array
     */
    public function save( $data, $old )
    {
        if (isset( $this->Fields )) {
            return $this->saveFields( $data, $old );
        }
        return $data;
    }

    /**
     * Calls save on the FieldsManager
     *
     * @param array $data
     * @param array $old
     *
     * @return array
     */
    public function saveFields( $data, $old )
    {
        return $this->Fields->save( $data, $old );
    }


    /**
     * Wrapper to actual render method.
     *
     * @return mixed
     */
    final public function module()
    {
        $data = $this->moduleData;
        if (isset( $this->Fields )) {
            $this->setupFieldData();
        }

        $this->View = $this->getView();

        if ($this->getEnvVar( 'action' )) {
            if (method_exists( $this, $this->getEnvVar( 'action' ) . 'Action' )) {
                $method = $this->getEnvVar( 'action' ) . 'Action';

                return call_user_func( array( $this, $method ), $data );
            }
        }

        return $this->render();

    }

    public function verify()
    {
        return $this->isPublic();
    }

    /**
     * Has no default output yet, and must be overwritten
     */
    public abstract function render();


    /**
     * Pass the raw module data to the fields, where the data
     * may be modified, depends on field configuration
     */
    public function setupFieldData()
    {
        // @TODO convert to model
        if (empty( $this->moduleData ) || !is_array( $this->moduleData )) {
            return;
        }

        $this->Fields->setup( $this->Model );
        foreach ($this->Model as $key => $v) {
            /** @var \Kontentblocks\Fields\Field $field */
            $field = $this->Fields->getFieldByKey( $key );
            $this->Model[$key] = ( $field !== null ) ? $field->getUserValue() : $v;
            $this->moduleData[$key] = ( $field !== null ) ? $field->getUserValue() : $v;
        }
    }

    /**
     * Creates a complete list item for the area
     */
    public function renderOptions()
    {

        $Node = new ModuleHTMLNode( $this );
        $Node->build();
    }


    /**
     * Generic set method to add module properties
     * if a set*PropertyName* method exist, it gets called
     *
     * @param $args
     */
    public function set( $args )
    {
        $whitelist = array(
            'areaContext',
            'area',
            'viewfile',
            'master',
            'parentId',
            'envVars',
            'settings',
            'moduleData',
            'rawModuleData',
            'View',
            'ViewLoader',
            'state',
            'instance_id',
            'mid',
            'template',
            'templateObj',
            'class',
            'master_id',
            'post_id',
            'overrides',
            'inDynamic',
            'uri',
            'path',
            'open'
        );

        if (!is_array( $args )) {
            _doing_it_wrong( 'set() on block instance', '$args must be an array of key/value pairs', '1.0.0' );
            return false;
        }

        foreach ($args as $k => $v) {
            if (method_exists( $this, 'set' . ucfirst( $k ) )) {
                $this->{'set' . ucfirst( $k )}( $v );
            } else {
                if (in_array( $k, $whitelist )) {
                    $this->$k = $v;
                } else {
                    trigger_error( 'property not in whitelist:' . $k, E_USER_NOTICE );
                }
            }
        }

    }

    /**
     * Extend envVars wirh additional given vars
     *
     * @param $vars
     */
    public function setEnvVars( $vars )
    {
        $this->envVars = wp_parse_args( $this->envVars, $vars );
    }

    /**
     * Set area context of module
     *
     * @param $areaContext
     */
    public function setAreaContext( $areaContext )
    {
        $this->setEnvVars( array( 'areaContext' => $areaContext ) );

    }

    /**
     * Get area context of module
     * @return mixed
     */
    public function getAreaContext()
    {

        return $this->getEnvVar( 'areaContext', false );

    }

    /**
     * If an Environment is given, add from that
     * and further extend envVars
     *
     * @param $Environment
     */
    public function setEnvVarsfromEnvironment( PostEnvironment $Environment )
    {
        $this->envVars = wp_parse_args(
            $this->envVars,
            array(
                'postType' => $Environment->get( 'postType' ),
                'pageTemplate' => $Environment->get( 'pageTemplate' ),
                'postId' => absint( $Environment->get( 'postId' ) ),
                'areaContext' => $this->getAreaContext(),
                'area' => $this->getArea()
            )
        );
    }

    /**
     * Gets the assigned viewfile (.twig) filename
     * Property is empty upon module creation, in that case we find the file to use
     * through the ModuleLoader class
     * @return string
     */
    public function getViewfile()
    {
        if (!filter_var( $this->getSetting( 'useViewLoader' ), FILTER_VALIDATE_BOOLEAN )) {
            return '';
        }

        // a viewfile was already set
        if (isset( $this->viewfile ) && !empty( $this->viewfile )) {
            return $this->viewfile;
        } else {
            /** @var \Kontentblocks\Modules\ModuleViewsRegistry $Registry */
            $Registry = Kontentblocks::getService( 'registry.moduleViews' );
            $Loader = $Registry->getViewLoader( $this );
            return $Loader->findDefaultTemplate();
        }

    }

    /**
     * Setter for viewfile
     *
     * @param $file
     *
     * @since 1.0.0
     * @return void
     */
    public function setViewfile( $file = '' )
    {
        $this->viewfile = $file;
    }


    /**
     * Retireve unique module id
     * @return string
     * @throws \Exception
     */
    public function getId()
    {
        if (!( $this->mid )) {
            throw new \Exception(
                'Module has no id assigned, and there really is no reason why this could be. The comittee assumes something is broken and stops the process.'
            );
        }

        return $this->mid;
    }

    /**
     * Setup a prepared Twig template instance if viewLoader is used
     * @return ModuleView|null
     * @since 1.0.0
     */
    public function getView()
    {
        if (!class_exists( 'Kontentblocks\Templating\ModuleTemplate' )) {
            class_alias( 'Kontentblocks\Templating\ModuleView', 'Kontentblocks\Templating\ModuleTemplate' );
        }
        if ($this->getSetting( 'useViewLoader' ) && is_null( $this->View )) {
            $tpl = $this->getViewfile();
            /** @var \Kontentblocks\Modules\ModuleViewsRegistry $Registry */
            $Registry = Kontentblocks::getService( 'registry.moduleViews' );
            $Loader = $Registry->getViewLoader( $this );
            $T = new ModuleView( $this );
            $full = $Loader->getTemplateByName( $tpl );
            if (isset( $full['fragment'] )) {
                $T->setTplFile( $full['fragment'] );
                $T->setPath( $full['basedir'] );
            }

            $this->View = $T;

            return $this->View;

        } else if ($this->View) {
            return $this->View;
        }

        return null;
    }


    /**
     * Get value from prepared / after field setup / data
     *
     * @param string $key
     * @param string $offset
     * @param mixed $return
     *
     * @return mixed
     */
    public function getData( $key = null, $offset = null, $return = '' )
    {
        if (empty( $this->moduleData ) or empty( $key )) {
            return false;
        }

        if (!is_null( $offset )) {
            return ( !empty( $this->moduleData[$offset][$key] ) ) ? $this->moduleData[$offset][$key] : $return;
        }

        return ( !empty( $this->moduleData[$key] ) ) ? $this->moduleData[$key] : $return;

    }

    /**
     * @param null $key
     * @param string $return
     * @param null $offset
     *
     * @return bool|string
     */
    public function getValue( $key = null, $return = '', $offset = null )
    {
        if (empty( $this->moduleData ) or empty( $key )) {
            return false;
        }

        if (!is_null( $offset )) {
            return ( !empty( $this->moduleData[$offset][$key] ) ) ? $this->moduleData[$offset][$key] : $return;
        }

        return ( !empty( $this->moduleData[$key] ) ) ? $this->moduleData[$key] : $return;

    }

    /**
     * Get value from unprepared / unfiltered original module data
     *
     * @param string $key
     * @param string $offset
     * @param mixed $return
     *
     * @TODO arrayKey should be handled differently
     * @return bool|string
     */
    public function getRawData( $key = null, $offset = null, $return = '' )
    {
        if (empty( $this->rawModuleData ) or empty( $key )) {
            return false;
        }

        if (!is_null( $offset )) {
            return ( !empty( $this->rawModuleData[$offset][$key] ) ) ? $this->rawModuleData[$offset][$key] : $return;
        }

        return ( !empty( $this->rawModuleData[$key] ) ) ? $this->rawModuleData[$key] : $return;

    }


    /**
     * Get value from environment vars array
     *
     * @param $var string
     * @param null $default
     * @since 1.0.0
     * @return mixed|null
     */
    public function getEnvVar( $var, $default = null )
    {
        if (isset( $this->envVars[$var] )) {
            return $this->envVars[$var];
        } else {
            return $default;
        }

    }


    /**
     * Get unique instance id
     * @return string
     */
    public function getModuleId()
    {
        return $this->instance_id;
    }

    /**
     * Get a single module setting
     *
     * @param $var string setting key
     *
     * @return mixed|null
     */
    public function getSetting( $var )
    {
        if (isset( $this->settings[$var] )) {
            return $this->settings[$var];
        } else {
            return null;
        }

    }


    /**
     * Set Additional data
     * @since 1.0.0
     */
    public function setData( $key, $value )
    {
        $this->moduleData[$key] = $value;

    }

    /**
     * Absolute path to class
     * Get's set upon registration
     * @since 1.0.0
     * @return string
     */
    public function getPath()
    {
        return $this->getSetting( 'path' );

    }

    /**
     * Get's set upon registration
     * @since 1.0.0
     * @return string URI of module
     */
    public function getUri()
    {
        return $this->getSetting( 'uri' );

    }

    /**
     * Check if module has attributes which make it non-public
     * @since 1.0.0
     * @return bool
     */
    public function isPublic()
    {
        if ($this->getSetting( 'disabled' ) || $this->getSetting( 'hidden' )) {
            return false;
        }

        if (!$this->state['active'] || $this->state['draft']) {
            return false;
        }

        return true;
    }

    public function toJSON()
    {
        // todo only used on frontend
        $toJSON = array(
            'envVars' => $this->envVars,
            'settings' => $this->settings,
            'state' => $this->state,
            'instance_id' => $this->getId(),
            'mid' => $this->getId(),
            'moduleData' => apply_filters( 'kb_modify_module_data', $this->rawModuleData, $this->settings ),
            'area' => $this->getArea(),
            'post_id' => $this->envVars['postId'],
            'areaContext' => $this->getAreaContext(),
            'viewfile' => $this->getViewfile(),
            'class' => get_class( $this ),
            'inDynamic' => Kontentblocks::getService( 'registry.areas' )->isDynamic( $this->getArea() ),
            'uri' => $this->getUri()
        );
        // only for master templates
        if (isset( $this->master ) && $this->master) {
            $toJSON['master'] = true;
            $toJSON['master_id'] = $this->master_id;
            $toJSON['parentId'] = $this->master_id;
            $toJSON['post_id'] = $this->master_id;
        }


        return $toJSON;

    }

    /**
     * Module default settings array
     * @since 1.0.0
     * @return array
     */
    public static function getDefaultSettings()
    {

        return array(
            'disabled' => false,
            'publicName' => 'Module Name Missing',
            'name' => '',
            'wrap' => true,
            'wrapperClasses' => '',
            'element' => apply_filters( 'kb.module.settings.element', 'div' ),
            'description' => '',
            'connect' => 'any',
            'hidden' => false,
            'predefined' => false,
            'inGlobalSidebars' => false,
            'inGlobalAreas' => false,
            'asTemplate' => true,
            'category' => 'standard',
            'useViewLoader' => false
        );

    }

    /**
     * Default State after creation
     * @since 1.0.0
     * @return array
     */
    public static function getDefaultState()
    {
        return array(
            'active' => true,
            'draft' => true
        );

    }

    /**
     * Returns a string indicator for the current status
     * @since 1.0.0
     * @return string
     */
    public function getStatusClass()
    {
        if ($this->state['active']) {
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
    public function _addAreaAttributes( $args )
    {
        if ($this->envVars) {
            $this->envVars += $args;
        }

    }

    /**
     * Get public module name
     * @return mixed
     * @since 1.0.0
     */
    public function getModuleName()
    {
        if (isset( $this->overrides )) {
            return $this->overrides['name'];
        } else {
            return $this->settings['name'];
        }

    }

    /**
     * No fields an options method override fallback
     * @since 1.0.0
     */
    private function renderEmptyOptions()
    {
        $tpl = new CoreView( 'no-module-options.twig' );
        echo $tpl->render( false );
    }

    /**
     * Set instance_id and mid property
     * (instance_id gets deprecated)
     * @param string $id
     */
    private function setInstance_id( $id )
    {
        $this->instance_id = $id;
        $this->mid = $id;
    }

}

