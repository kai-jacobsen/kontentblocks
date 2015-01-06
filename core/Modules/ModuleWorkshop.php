<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\Environment;
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
    private $moduleArgs;

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
     * Setup module args and class properties
     * @param Environment $Environment
     * @param array $args
     */
    public function __construct( Environment $Environment, $args = array(), $oldArgs = array() )
    {
        $this->Environment = $Environment;
        $this->moduleArgs = $this->setupModuleArgs( $args, $oldArgs );
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
            return $this->moduleArgs;
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
            $update = $this->Environment->getStorage()->addToIndex( $this->createModuleId(), $this->moduleArgs );
            if (!is_null( $this->newData )) {
                $this->Environment->getStorage()->saveModule( $this->getNewId(), $this->newData );
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
                $this->getDefinitionArray()['class'],
                $this->getDefinitionArray(),
                $this->Environment
            );
            return $this->Module = $Factory->getModule();
        }
        return false;
    }

    /**
     * @param $data
     * @return bool|\Kontentblocks\Backend\Storage\new|null
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
     * @param $args
     * @return array
     */
    private function setupModuleArgs( $args, $oldargs )
    {
        if ($oldargs) {
            unset( $oldargs['instance_id'] );
            unset( $oldargs['mid'] );
        }

        $args = wp_parse_args( $args, $oldargs );

        $this->newId = $mid = ( isset( $args['mid'] ) ) ? sanitize_key( $args['mid'] ) : $this->createModuleId();
        $defaults = array(
            // id
            'instance_id' => $mid,
            'mid' => $mid,
            // template
            'template' => false,
            'master' => false,
            'templateObj' => array(
                'id' => '',
                'name' => '',
            ),
            'masterObj' => array(
                'parentId' => ''
            ),
            // generic
            'class' => '',
            'overrides' => array(
                'name' => null
            ),
            // environmental
            'post_id' => $this->Environment->getId(),
            'area' => 'undefined',
            'areaContext' => 'undefined',
            'state' => array(
                'draft' => true,
                'active' => true
            )
        );

        return wp_parse_args( $args, $defaults );
    }

    /**
     * @return string
     */
    private function createModuleId()
    {
        $prefix = apply_filters( 'kb.module.key.prefix', 'module_' );
        $this->Environment->getStorage()->reset();
        $count = Utilities::getHighestId( $this->Environment->getStorage()->getIndex() ) + 1;
        return $prefix . $this->Environment->getId() . '_' . $count;
    }

    private function validate()
    {
        if (is_null( $this->moduleArgs['class'] )) {
            return false;
        }

        if (!class_exists( $this->moduleArgs['class'] )) {
            return false;
        }

        return true;
    }

}