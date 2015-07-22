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

    protected $Environment;

    protected $Modules = array();

    public function __construct( Environment $Environment )
    {
        $this->Environment = $Environment;
        $this->setupModulesFromStorageIndex();
    }

    /**
     * Create PropertiesObjects from stored index data
     * @return ModuleRepository
     */
    private function setupModulesFromStorageIndex()
    {
        $index = $this->Environment->getStorage()->getIndex();
        if (is_array( $index )) {
            foreach ($index as $module) {
                if (!is_admin()) {
                    $module = apply_filters( 'kb.before.frontend.setup', $module );
                }
                $Workshop = new ModuleWorkshop( $this->Environment, $module );
                if ($Workshop->isValid()) {
                    $this->Modules[$Workshop->getNewId()] = $Workshop->getModule();
                }
            }
        }
        return $this;
    }

    /**
     * @return array
     */
    public function getModules()
    {
        return $this->Modules;
    }

    /**
     * Get PropertiesObject from collection by id
     * @param $mid
     * @return null|Module
     */
    public function getModuleObject( $mid )
    {
        if (isset( $this->Modules[$mid] )) {
            return $this->Modules[$mid];
        }
        return null;
    }
}