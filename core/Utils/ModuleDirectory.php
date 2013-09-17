<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Admin\AbstractDataContainer;
class ModuleDirectory
{
    static $instance;
    public $modules = array();

    public function getInstance( )
    {
        if ( null == self::$instance ) {
            self::$instance = new self;
        }

        
        return self::$instance;

    }

    public function add( $classname )
    {
        if ( !isset( $this->modules[ 'classname' ] ) ) {
            $this->modules[ $classname ] = new $classname;
        }

    }

    public function getAllModules( AbstractDataContainer $dataContainer)
    {
        if ($dataContainer->isPostContext() ){
            return $this->modules;
        } else {
            return array_filter($this->modules, array($this, '_filterForGlobalArea'));
        }

    }

    public function _filterForGlobalArea($module)
    {
        if ($module->settings['in_dynamic']){
            return $module;
        }
    }

}
