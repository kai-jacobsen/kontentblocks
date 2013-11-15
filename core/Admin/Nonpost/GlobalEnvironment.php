<?php

namespace Kontentblocks\Admin\Nonpost;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Utils\GlobalDataHandler,
    Kontentblocks\Utils\RegionRegistry,
    Kontentblocks\Modules\ModuleFactory;

class GlobalEnvironment extends AbstractEnvironment
{

    protected $globalData;
    protected $areas;
    protected $modules;

    public function __construct()
    {
        $this->globalData = new GlobalDataHandler();
        $this->areas      = $this->_findAreas();
        $this->modules    = $this->_setupModules();

    }

    public function isPostContext()
    {
        return false;

    }

    public function getAllModules()
    {
        return $this->modules;

    }

    public function getAreaSettings( $id )
    {
        $settings = $this->globalData->getAreaSettings();
        if ( !empty( $settings[ $id ] ) ) {
            return $settings[ $id ];
        }
        return false;

    }

    public function getModulesforArea( $areaid )
    {
        $byArea = $this->getSortedModules();
        if ( !empty( $byArea[ $areaid ] ) ) {
            return $byArea[ $areaid ];
        }
        else {
            return false;
        }

    }

    public function getSortedModules()
    {
        $sorted = array();

        if ( is_array( $this->modules ) ) {
            foreach ( $this->modules as $module ) {
                $area_id = $module->area;

                $sorted[ $area_id ][] = $module;
            }
            return $sorted;
        }

    }

    private function _setupModules()
    {
        $collection = array();
        $index      = $this->globalData->getIndex();
        if ( is_array( $index ) ) {
            foreach ( $index as $module ) {
                $factory      = new ModuleFactory( $module );
                $collection[] = $factory->getModule();
            }
        }
        return $collection;

    }

    public function getModuleData( $id )
    {
        return $this->globalData->getModuleData( $id );

    }

    public function _findAreas()
    {
        $RegionRegistry = RegionRegistry::getInstance();
        return $RegionRegistry->getGlobalAreas();

    }

    public function getDataHandler()
    {
        return $this->globalData;

    }

}
