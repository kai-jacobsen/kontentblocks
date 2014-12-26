<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\PostEnvironment;
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

    protected $Environment;
    protected $moduleArgs;

    /**
     * Setup module args and class properties
     * @param PostEnvironment $Environment
     * @param array $args
     */
    public function __construct( PostEnvironment $Environment, $args = array() )
    {
        $this->Environment = $Environment;
        $this->moduleArgs = $this->setupModuleArgs( $args );
    }

    /**
     * Returns setup module attributes on success
     * false if attributes are incomplete
     * @return array|bool
     */
    public function getDefinitionArray()
    {
        if (is_null( $this->moduleArgs['class'] )) {
            return false;
        }

        if (!class_exists( $this->moduleArgs['class'] )) {

            return false;
        }

        return $this->moduleArgs;
    }

    /**
     * Creates a new module by adding it to the index of the current post
     * @return mixed
     */
    public function create()
    {
        if (is_array( $this->getDefinitionArray() )) {
            return $this->Environment->getStorage()->addToIndex( $this->createModuleId(), $this->moduleArgs );
        }
    }

    /**
     * Parse provided attributes with defaults
     * @param $args
     * @return array
     */
    private function setupModuleArgs( $args )
    {
        $mid = ( isset( $args['mid'] ) ) ? $args['mid'] : $this->createModuleId();
        $defaults = array(
            // id
            'instance_id' => $mid,
            'mid' => $mid,
            // template
            'template' => false,
            'master' => false,
            'templateObj' => array(
                'id' => null,
                'name' => null,
            ),
            'masterObj' => array(
                'parentId' => null
            ),
            // generic
            'class' => null,
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
        $count = Utilities::getHighestId( $this->Environment->getStorage()->getIndex() ) + 1;
        return $prefix . $this->Environment->getId() . '_' . $count;
    }

}