<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Admin\AbstractDataContainer,
    Kontentblocks\Utils\GlobalData,
    Kontentblocks\Utils\AreaDirectory;

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
        return $this->globalData->getIndexForArea($areaid);
        

    }


    private function _setupModules()
    {
        //TODO
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
