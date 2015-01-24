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
                $Ws = new ModuleWorkshop( $this->Environment, $module );
                $this->Modules[$Ws->getNewId()] = $Ws->getModule();


            }
        }
        return $this;
    }

    public function getModules()
    {
        return $this->Modules;
    }

    /**
     * Get PropertiesObject from collection by id
     * @param $id
     * @return null|ModuleProperties
     */
    public function getModuleObject( $id )
    {
        if (isset( $this->Modules[$id] )) {
            return $this->Modules[$id];
        }
        return null;
    }


}