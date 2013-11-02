<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Abstracts\AbstractContextData,
    Kontentblocks\Modules\Module,
    Kontentblocks\Utils\RegionRegistry;

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
            $args = $classname::$defaults;

            // manually add the classname for futire reference
            $args[ 'class' ] = $classname;

            // add missing args from general Defaults
            $finalargs = wp_parse_args( $args, Module::getDefaults() );

            // Add module to registry
            $this->modules[ $classname ] = $finalargs;
            // Handle connection to regions
            RegionRegistry::getInstance()->connect( $classname, $finalargs );
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

    public function getAllModules( AbstractContextData $dataContainer )
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

}
