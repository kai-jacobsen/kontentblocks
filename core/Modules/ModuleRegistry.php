<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Modules\Module,
    Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Backend\Areas\Area;

class ModuleRegistry
{

    static $instance;
    public $modules = array();

    public static function getInstance()
    {
        if ( null == self::$instance ) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    public function add( $classname )
    {
        if ( !isset( $this->modules[ 'classname' ] ) && property_exists( $classname, 'defaults' ) ) {
            // Defaults from the specific Module
            // contains id, name, public name etc..
            $moduleArgs      = array();
            $args            = $classname::$defaults;
            $args[ 'class' ] = $classname;

            // add missing args from general Defaults
            $moduleArgs[ 'settings' ] = wp_parse_args( $args, Module::getDefaults() );
            $moduleArgs[ 'state' ] = Module::getDefaultState();
            // Add module to registry
            $this->modules[ $classname ] = $moduleArgs;
            // Handle connection to regions
            AreaRegistry::getInstance()->connect( $classname, $moduleArgs );
        }

    }

    public function get( $classname )
    {
        if ( isset( $this->modules[ $classname ] ) ) {
            return $this->modules[ $classname ];
        }
        else {
            return new \Exception( 'Cannot get module from collection' );
        }

    }

    public function getAllModules( AbstractEnvironment $dataContainer )
    {
        if ( $dataContainer->isPostContext() ) {
            return $this->modules;
        }
        else {
            return array_filter( $this->modules, array( $this, '_filterForGlobalArea' ) );
        }

    }

    public function _filterForGlobalArea( $module )
    {
        if ( isset( $module[ 'globallyAvailable' ] ) && $module[ 'globallyAvailable' ] === true ) {
            return $module;
        }

    }

    public function getModuleTemplates()
    {
        return array_filter( $this->modules, array( $this, '_filterModuleTemplates' ) );

    }

    private function _filterModuleTemplates( $module )
    {
        if ( isset( $module->settings[ 'templateable' ] ) and $module->settings[ 'templateable' ] == true ) {
            return $module;
        }
    }

    /**
     * Get modules which are set to be available
     * by an area.
     * 
     * return array 
     */
    public function getValidModulesForArea( Area $area, AbstractEnvironment $environment )
    {
        // declare array
        $modules = $this->getAllModules( $environment );

        if ( empty( $modules ) ) {
            return false;
        }

        $validModules = array();

        foreach ( $modules as $module ) {

            // disabled modules are not added
            if ( $module[ 'settings' ][ 'disabled' ] ) {
                continue;
            }

            // shorthand caegory
            $cat = $module[ 'settings' ][ 'category' ];

            // Module has to be assigned to area, either by area definition or through module 'connect'
            if ( in_array( $module[ 'settings' ][ 'class' ], ( array ) $area->assignedModules ) ) {
                $validModules[ $module[ 'settings' ][ 'class' ] ] = $module;
            }


            // 'core' modules are assigned anyway
            if ( $cat == 'core' ) {
                $validModules[ $module[ 'settings' ][ 'class' ] ] = $module;
            }

        }
        //sort alphabetically
        usort( $validModules, array( $this, '_sort_by_name' ) );

        return $validModules;

    }

    /**
     * Usort callback to sort modules alphabetically by name
     * @param array $a
     * @param array $b
     * @return int
     */
    private function _sort_by_name( $a, $b )
    {
        $al = strtolower( $a[ 'settings' ][ 'public_name' ] );
        $bl = strtolower( $b[ 'settings' ][ 'public_name' ] );

        if ( $al == $bl ) {
            return 0;
        }
        return ($al > $bl) ? +1 : -1;

    }

}
