<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;

/**
 * Class ModuleRepository
 * @package Kontentblocks\Modules
 */
class ModuleRepository
{

    protected $environment;

    protected $modules = array();

    public function __construct( Environment $environment )
    {
        $this->environment = $environment;
        $this->setupModulesFromStorageIndex();
    }

    /**
     * Create PropertiesObjects from stored index data
     * @return ModuleRepository
     */
    private function setupModulesFromStorageIndex()
    {
        $index = $this->environment->getStorage()->getIndex();
        $areas = $this->environment->findAreas();
        if (is_array( $index )) {
            foreach ($index as $module) {
                if (in_array($module['area'], array_keys($areas))){
                    if (!is_admin()) {
                        $module = apply_filters( 'kb.before.frontend.setup', $module );
                    }
                    $workshop = new ModuleWorkshop( $this->environment, $module );
                    if ($workshop->isValid()) {
                        $this->modules[$workshop->getNewId()] = $workshop->getModule();
                    }
                }
            }
        }
        $this->setupAliases();
        return $this;
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
    public function getModuleObject( $mid )
    {
        if (isset( $this->modules[$mid] )) {
            return $this->modules[$mid];
        }
        return null;
    }

    private function setupAliases()
    {
        if ($this->environment->getPostObject()->post_type === 'kb-gmd'){



        }
    }
}