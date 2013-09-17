<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Admin\AbstractDataContainer;

class GlobalDataContainer extends AbstractDataContainer
{
    protected $areas;
    protected $modules;


    public function __construct()
    {
        $this->areas = get_option('kb_dynamic_areas');

    }
    
    public function isPostContext()
    {
        return false;
    }
    
    public function getAllModules()
    {
        

    }
    
    public function getModulesforArea( $id )
    {
        

    }

    private function _setupModules()
    {
        

    }
}
