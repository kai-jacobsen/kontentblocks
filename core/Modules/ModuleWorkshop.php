<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
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
     * @var Environment
     */
    private $Environment;

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
    private $Module;

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
     * @param Environment $Environment
     * @param array $attrs
     */
    public function __construct( Environment $Environment, $attrs = array(), $oldattrs = array() )
    {
        $this->Environment = $Environment;

        $this->moduleattrs = $this->setupModuleattrs( $attrs, $oldattrs );
        $this->valid = $this->validate();
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
     * Creates a new module by adding it to the index of the current post
     * @return mixed
     */
    public function create()
    {
        if (is_array( $this->getDefinitionArray() ) && !$this->isLocked()) {
            $update = $this->Environment->getStorage()->addToIndex( $this->createModuleId(), $this->moduleattrs );
            if (!is_null( $this->newData )) {
                $this->Environment->getStorage()->saveModule( $this->getNewId(), $this->newData );
            } else {
                $this->Environment->getStorage()->saveModule( $this->getNewId(), $this->prepareFromModule() );
            }


            if ($update) {
                $this->locked = true;
                return true;
            }
        }
        return false;
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
     * @return Module|null
     */
    public function getModule()
    {
        if ($this->isValid()) {
            $Factory = new ModuleFactory(
                $this->getPropertiesObject(),
                $this->Environment
            );
            return $this->Module = $Factory->getModule();
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

    /**
     * Return new module id
     * @return mixed
     */
    public function getNewId()
    {
        return $this->newId;
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
     * @return bool
     */
    public function isValid()
    {
        return $this->valid;
    }

    /**
     * Parse provided attributes with defaults
     * @param $attrs
     * @return array
     */
    private function setupModuleattrs( $attrs, $oldattrs )
    {
        if ($oldattrs) {
            unset( $oldattrs['instance_id'] );
            unset( $oldattrs['mid'] );
        }
        $attrs = $this->handleLegacyattrs( wp_parse_args( $attrs, $oldattrs ) );
        $this->newId = $mid = ( isset( $attrs['mid'] ) ) ? $attrs['mid'] : $this->createModuleId();
        $attrs['mid'] = $attrs['instance_id'] = $mid;
        $attrs['post_id'] = $this->Environment->getId();
        $attrs = wp_parse_args( $attrs, $this->getDefaults() );

        return $this->clean( $attrs );
    }

    /**
     * crreate a new module id, based on the storage id and the current index
     * @return string
     */
    private function createModuleId()
    {
        $prefix = apply_filters( 'kb.module.key.prefix', 'module_' );
        $this->Environment->getStorage()->reset();
        $count = Utilities::getHighestId( $this->Environment->getStorage()->getIndex() ) + 1;
        return $prefix . $this->Environment->getId() . '_' . $count;
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
     * Remap old structure to new
     * @param $attrs
     * @return mixed
     */
    private function handleLegacyattrs( $attrs )
    {
        if (array_key_exists( 'master_id', $attrs )) {
            $attrs['masterRef'] = array(
                'parentId' => $attrs['master_id']
            );
        }

        if (array_key_exists( 'instance_id', $attrs )) {
            $attrs['mid'] = $attrs['instance_id'];
        }

        return $attrs;
    }

    /**
     * Persistent module attributes
     * @return array
     */
    private function getDefaults()
    {
        return array(
            // id
            'instance_id' => '',
            'mid' => '',
            // template
            'template' => false,
            'master' => false,
            'templateRef' => array(
                'id' => null,
                'name' => null,
            ),
            'masterRef' => array(
                'parentId' => null
            ),
            // generic
            'class' => '',
            'overrides' => array(
                'name' => null
            ),
            // environmental
            'post_id' => null,
            'area' => 'undefined',
            'areaContext' => 'undefined',
            'state' => array(
                'draft' => true,
                'active' => true
            ),
            'viewfile' => ''
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

    private function prepareFromModule()
    {
        $fModule = new $this->moduleattrs['class']($this->getPropertiesObject(), null, $this->Environment);

        if (!$fModule->Fields && !method_exists( $this->Module, 'defaultData' )) {
            return '';
        }

        if ($fModule->Fields) {
            $data = array();
            $config = $fModule->Fields->export();
            foreach (array_values($config) as $attrs) {
                if ($attrs['arrayKey']) {
                    $data[$attrs['arrayKey']][$attrs['key']] = '';
                } else {
                    $data[$attrs['key']] = '';
                }
            }
            return $data;
        }

        if (method_exists( $fModule, 'defaultData' )) {
            return $fModule->defaultData();
        }

    }

}