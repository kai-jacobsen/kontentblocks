<?php

namespace Kontentblocks\Interfaces;

interface InterfaceEnvironment
{

    public function getAllModules();
    
    public function getModulesForArea($id);
    
    public function getModuleData($id);
}
