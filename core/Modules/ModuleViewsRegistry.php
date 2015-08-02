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
     * Get a Module specific View Filesystem instance
     * @param Module $module
     * @return ModuleViewFilesystem
     */
    public function getViewFileSystem( Module $module )
    {
        $classname = get_class( $module );
//        if (isset( $this->views[$classname] )) {
//            return $this->views[$classname];
//        }

        $fileSystem = new ModuleViewFilesystem( $module );
        $this->views[$classname] = $fileSystem;
        return $fileSystem;

    }

    /**
     *
     * @param Module $Module
     * @return ModuleViewLoader
     */
    public function getViewLoader( Module &$Module )
    {
//        $hash = spl_object_hash($Module);
//
//        if (isset( $this->loaders[$hash] )) {
//            return $this->loaders[$hash];
//        }
        $viewLoader = new ModuleViewLoader( $Module );
//        $this->loaders[$hash] = $ViewLoader;
        return $viewLoader;

    }
} 