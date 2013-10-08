<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Admin\AbstractDataContainer,
    Kontentblocks\Utils\GlobalData,
    Kontentblocks\Utils\AreaDirectory,
    Kontentblocks\Modules\ModuleFactory;

class GlobalDataContainer extends AbstractDataContainer
{

    protected $globalData;
    protected $areas;
    protected $modules;

    public function __construct()
    {
        $this->globalData = new GlobalData();
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
        $AreaDirectory = AreaDirectory::getInstance();
        return $AreaDirectory->getGlobalAreas();

    }

    public function getDataHandler()
    {
        return $this->globalData;

    }

}
