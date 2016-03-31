<?php

namespace Kontentblocks\Modules;


/**
 * Class ModuleViewsRegistry
 *
 * @package Kontentblocks\Modules
 */
class ModuleViewsRegistry
{

    protected $views = array();
    protected $loaders = array();

    /**
     *
     * @param Module $module
     * @return ModuleViewLoader
     */
    public function getViewLoader(Module $module)
    {
        $viewLoader = new ModuleViewLoader($module, $this->getViewFileSystem($module));
        return $viewLoader;

    }

    /**
     * Get a Module specific View Filesystem instance
     * @param Module $module
     * @return ModuleViewFilesystem
     */
    public function getViewFileSystem(Module $module)
    {
        $classname = get_class($module);
        if (isset($this->views[$classname])) {
            return $this->views[$classname];
        }

        $fileSystem = new ModuleViewFilesystem($module);
        $this->views[$classname] = $fileSystem;
        return $fileSystem;

    }
} 