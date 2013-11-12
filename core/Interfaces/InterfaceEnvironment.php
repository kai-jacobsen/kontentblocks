<?php

namespace Kontentblocks\Interfaces;

interface InterfaceEnvironment
{
    public function isPostContext();

    public function getAllModules();
    
    public function getModulesforArea($id);
    
    public function getModuleData($id);
}
