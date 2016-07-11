<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleWorkshop
 * @package Kontentblocks\Modules
 *
 * Objective of this class:
 * PostEnvironent comes in
 * returns one, complete array for the module index
 */
class ModuleWorkshop
{
    /**
     * @var PostEnvironment
     */
    private $environment;

    /**
     * @var array
     */
    private $moduleattrs;

    /**
     * @var string
     */
    private $newId;

    /**
     * @var array
     */
    private $newData;

    /**
     * @var \Kontentblocks\Modules\Module
     */
    private $module;

    /**
     * @var bool
     */
    private $locked = false;

    /**
     * @var bool
     */
    private $valid = false;

    /**
     * Setup module attrs and class properties
     * @param PostEnvironment $environment
     * @param array $attrs
     * @param array $oldattrs
     */
    public function __construct( PostEnvironment $environment, array $attrs = array(), array $oldattrs = array() )
    {
        $this->start = microtime(true);

        $this->environment = $environment;
        $this->moduleattrs = $this->setupModuleattrs( $attrs, $oldattrs );
        $this->valid = $this->validate();
    }

    /**
     * Parse provided attributes with defaults
     * @param $attrs
     * @param $oldattrs
     * @return array
     */
    private function setupModuleattrs( $attrs, $oldattrs )
    {
        if ($oldattrs) {
            unset( $oldattrs['mid'] );
        }

        $attrs = $this->handleLegacyattrs( wp_parse_args( $attrs, $oldattrs ) );
        $this->newId = $mid = ( isset( $attrs['mid'] ) ) ? $attrs['mid'] : $this->createModuleId();
        $attrs['mid'] = $mid;
        $attrs = wp_parse_args( $attrs, $this->getDefaults() );


//        if (empty( $attrs['post_id'] )) {
        $attrs['post_id'] = $this->environment->getId();
        $attrs['postId'] = $this->environment->getId();
//        }

        if (!$attrs['globalModule']){
            $attrs['parentObjectId'] = $this->environment->getId();
        }

        if (is_null( $attrs['parentObjectId'] ) || $attrs['parentObjectId'] === 0) {
            $attrs['parentObjectId'] = $attrs['post_id'];
        }

        $attrs['parentObject'] = ( is_numeric( $attrs['parentObjectId'] ) && $attrs['globalModule'] ) ? get_post(
            $attrs['parentObjectId']
        ) : null;

        
        return $this->clean( $attrs );
    }

    /**
     * Remap old structure to new
     * @param $attrs
     * @return mixed
     */
    private function handleLegacyattrs( $attrs )
    {

        if (array_key_exists( 'instance_id', $attrs )) {
            $attrs['mid'] = $attrs['instance_id'];
        }

        return $attrs;
    }

    /**
     * crreate a new module id, based on the storage id and the current index
     * @return string
     */
    private function createModuleId()
    {
        $prefix = apply_filters( 'kb.module.key.prefix', 'module_' );
        $this->environment->getStorage()->reset();
        $count = Utilities::getHighestId( $this->environment->getStorage()->getIndex() ) + 1;
        return $prefix . $this->environment->getId() . '_' . $count;
    }

    /**
     * Persistent module attributes
     * @return array
     */
    private function getDefaults()
    {
        return array(
            // id
            'mid' => '',
            'oMid' => '',
            // gmodule
            'globalModule' => false,
            'parentObjectId' => null,
            'parentObject' => null,
            // generic
            'class' => '',
            'overrides' => array(
                'name' => null,
                'loggedinonly' => false,
                'wrapperclasses' => ''
            ),
            // environmental
            'post_id' => null,
            'postId' => null,
            'area' => '_internal',
            'areaContext' => 'normal',
            'state' => array(
                'draft' => true,
                'active' => true
            ),
            'viewfile' => '',
            'submodule' => false
        );
    }

    /**
     * Remove attrs which are not in the defaults array
     * So there is no way to have arbitrary data stored in the index
     * @param $attrs
     * @return mixed
     */
    private function clean( $attrs )
    {
        foreach (array_keys( $attrs ) as $k) {
            if (!in_array( $k, array_keys( $this->getDefaults() ) )) {
                unset( $attrs[$k] );
            }
        }
        return $attrs;
    }

    /**
     * Validate that there is the module class
     * @return bool
     */
    private function validate()
    {
        if (is_null( $this->moduleattrs['class'] )) {
            _K::error( 'Workshop class parameter is null' );
            return false;
        }


        if (!class_exists( $this->moduleattrs['class'] )) {
            _K::error( $this->moduleattrs['class'] . ' not found.' );
            return false;
        }


        return true;
    }

    /**
     *
     * @return bool|Module|null
     */
    public function createAndGet()
    {
        if ($this->isValid() && $this->create()) {
            return $this->getModule();
        }
        return false;
    }

    /**
     * @return bool
     */
    public function isValid()
    {
        return $this->valid;
    }

    /**
     * Creates a new module by adding it to the index of the current post
     * @return mixed
     */
    public function create()
    {
        if (is_array( $this->getDefinitionArray() ) && !$this->isLocked()) {
            $update = $this->environment->getStorage()->addToIndex( $this->createModuleId(), $this->moduleattrs );
            if (!is_null( $this->newData )) {
                $this->environment->getStorage()->saveModule( $this->getNewId(), $this->newData );
            } else {
                $this->environment->getStorage()->saveModule( $this->getNewId(), $this->prepareFromModule() );
            }

            if ($update) {
                do_action( 'kb.module.new', $this->getModule() );
                $this->locked = true;
                return true;
            }
        }
        return false;
    }

    /**
     * Returns setup module attributes on success
     * false if attributes are incomplete
     * @return array|bool
     */
    public function getDefinitionArray()
    {
        if ($this->isValid()) {
            return $this->moduleattrs;
        }

        return false;
    }

    /**
     *
     * @return bool
     */
    public function isLocked()
    {
        return $this->locked;
    }

    /**
     * Return new module id
     * @return mixed
     */
    public function getNewId()
    {
        return $this->newId;
    }


    private function prepareFromModule()
    {
        /** @var \Kontentblocks\Modules\Module $fModule */
        $fModule = new $this->moduleattrs['class']( $this->getPropertiesObject(), null, $this->environment );
        if (!$fModule->fields && !method_exists( $this->module, 'defaultData' )) {
            return '';
        }

        if ($fModule->fields) {
            $data = array();
            $config = $fModule->fields->export();
            foreach (array_values( $config ) as $attrs) {
                if ($attrs['arrayKey']) {
                    $data[$attrs['arrayKey']][$attrs['key']] = $attrs['std'];
                } else {
                    $data[$attrs['key']] = $attrs['std'];
                }
            }
            return $data;
        }

        if (method_exists( $fModule, 'defaultData' )) {
            return $fModule->defaultData();
        }

    }

    /**
     * Create a new Module Properties object
     * @return bool|ModuleProperties
     */
    public function getPropertiesObject()
    {
        if ($this->isValid()) {
            return new ModuleProperties( $this->getDefinitionArray() );
        }
        return false;
    }

    /**
     * @return Module|null
     */
    public function getModule()
    {
        if ($this->isValid()) {
            $factory = new ModuleFactory(
                $this->getPropertiesObject(),
                $this->environment
            );
            $this->module = $factory->getModule();
            return $this->module;
        }
        return false;
    }

    /**
     * @param $data
     * @return bool|\Kontentblocks\Backend\Storage\|null
     */
    public function setData( $data )
    {
        if (!is_null( $data ) && $this->isValid()) {
            $this->newData = $data;
        }
        return null;
    }

}