<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\PostEnvironment;

/**
 * Class ModuleRepository
 * @package Kontentblocks\Modules
 */
class ModuleRepository
{

    /**
     * @var array
     */
    public $modulesByArea;

    /**
     * @var PostEnvironment
     */
    protected $environment;

    /**
     * @var array
     */
    protected $modules = [];

    protected $modulesByType = [];

    private $initialized = false;


    /**
     * ModuleRepository constructor.
     * @param PostEnvironment $environment
     */
    public function __construct(PostEnvironment $environment)
    {
        $this->environment = $environment;
        $this->setupModulesFromStorageIndex();
        $this->modulesByArea = $this->sortedByArea();
        $this->modulesByType = $this->sortedByType();
    }

    /**
     * Create PropertiesObjects from stored index data
     * @return ModuleRepository
     */
    private function setupModulesFromStorageIndex()
    {
        $index = $this->environment->getStorage()->getIndex();
        $areas = $this->environment->findAreas();
        if (is_array($index) && !$this->initialized) {
            foreach ($index as $module) {
                if (in_array($module['area'], array_keys($areas))) {
                    if (!is_admin()) {
                        $module = apply_filters('kb.before.frontend.setup', $module);
                    }
                    $workshop = new ModuleWorkshop($this->environment, $module);
                    if ($workshop->isValid()) {
                        $module = $workshop->getModule();
                        if (!$module->properties->submodule) {
                            $this->modules[$workshop->getNewId()] = $module;
                        }
                    }
                }
            }
            $this->initialized = true;
        }
        return $this;
    }

    /**
     * Sorts module definitions to areas
     * @return array
     * @since 0.1.0
     */
    public function sortedByArea()
    {
        $sorted = [];
        if (is_array($this->modules)) {
            /** @var \Kontentblocks\Modules\Module $module */
            foreach ($this->modules as $module) {
                $sorted[$module->properties->area->id][$module->getId()] = $module;
            }
            return $sorted;
        }
    }

    /**
     * @return array
     */
    private function sortedByType()
    {
        $sorted = [];
        if (is_array($this->modules)) {
            /** @var \Kontentblocks\Modules\Module $module */
            foreach ($this->modules as $module) {
                $mslug = $module->properties->getSetting('id');
                if (!isset($sorted[$mslug])) {
                    $sorted[$mslug] = [];
                }
                $sorted[$mslug][] = $module;
            }
            return $sorted;
        }
    }

    /**
     * returns module definitions filtered by area
     *
     * @param string $areaid
     * @return mixed
     * @since 0.1.0
     */
    public function getModulesForArea($areaid)
    {
        $byArea = $this->sortedByArea();
        if (!empty($byArea[$areaid])) {
            return $byArea[$areaid];
        } else {
            return array();
        }
    }

    /**
     * @return array
     */
    public function getModules()
    {
        return $this->modules;
    }

    /**
     * Get PropertiesObject from collection by id
     * @param $mid
     * @return null|Module
     */
    public function getModuleObject($mid)
    {
        if (isset($this->modules[$mid])) {
            return $this->modules[$mid];
        }
        return null;
    }

}