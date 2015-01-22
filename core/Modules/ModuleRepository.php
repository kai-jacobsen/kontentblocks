<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Storage\ModuleStorage;

/**
 * Class ModuleRepository
 * @package Kontentblocks\Modules
 */
class ModuleRepository
{

    protected $ModuleStorage;

    protected $Modules = array();

    public function __construct( ModuleStorage $Storage )
    {
        $this->ModuleStorage = $Storage;
        $this->setupModulesFromStorageIndex();
    }

    private function setupModulesFromStorageIndex()
    {
        $index = $this->ModuleStorage->getIndex();
        if (is_array( $index )) {
            foreach ($index as $module) {
                $Ws = new ModuleWorkshop($this->ModuleStorage, $module);
                array_push( $this->Modules, $Ws->getPropertiesObject() );
            }
        }
    }


}