<?php

namespace Kontentblocks\Backend\Environment;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Backend\Environment\Save\SaveGlobal;

class GlobalEnvironment extends AbstractEnvironment
{
    protected $areaID;
    protected $globalData;
    protected $areas;
    protected $modules;
    protected $Storage;

    public function __construct($id)
    {
        $this->areaId = $id;
        $this->Storage = \Kontentblocks\Helper\getStorage($id);
        $this->areas = $this->_findAreas();
        $this->modules = $this->_setupModules();

    }


    public function getAllModules()
    {
        return $this->modules;

    }

    public function getAreaSettings($id)
    {
        $settings = $this->globalData->getAreaSettings();
        if (!empty($settings[$id])) {
            return $settings[$id];
        }
        return false;

    }

    public function getModulesForArea($areaid)
    {
        $byArea = $this->getSortedModules();
        if (!empty($byArea[$areaid])) {
            return $byArea[$areaid];
        } else {
            return false;
        }

    }

    public function getSortedModules()
    {
        $sorted = array();

        if (is_array($this->modules)) {
            foreach ($this->modules as $module) {
                $sorted[$module['area']][$module['instance_id']] = $module;
            }
            return $sorted;
        }

    }

    private function _setupModules()
    {
        $collection = array();
        $index = $this->Storage->getIndex();
        if (is_array($index)) {
            foreach ($index as $module) {
                $collection[$module['instance_id']] = ModuleFactory::parseModule($module);
            }
        }
        return $collection;

    }

    public function getModuleData($id)
    {
        return $this->Storage->getModuleData($id);

    }

    public function isPostContext(){
        return false;
    }

    public function _findAreas()
    {
        $AreaRegistry = AreaRegistry::getInstance();
        return $AreaRegistry->getGlobalAreas();

    }

    public function getStorage()
    {
        return $this->Storage;

    }

    public function save()
    {
        $SaveHandler = new SaveGlobal($this);
        $SaveHandler->save();
    }
}
