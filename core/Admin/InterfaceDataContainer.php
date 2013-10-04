<?php

namespace Kontentblocks\Admin;

interface InterfaceDataContainer
{

    public function isPostContext();

    public function getAllModules();
    
    public function getModulesforArea($id);
    
    public function getModuleData($id);
}
