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
     * @param Module $Module
     * @return ModuleViewFilesystem
     */
    public function getViewFileSystem( Module $Module )
    {
        $classname = get_class( $Module );

        if (isset( $this->views[$classname] )) {
            return $this->views[$classname];
        }

        $FileSystem = new ModuleViewFilesystem( $Module );
        $this->views[$classname] = $FileSystem;
        return $FileSystem;

    }

    /**
     *
     * @param Module $Module
     * @return ModuleViewLoader
     */
    public function getViewLoader( Module $Module )
    {


        if (isset( $this->loaders[$Module->getId()] )) {
            return $this->loaders[$Module->getId()];
        }

        $ViewLoader = new ModuleViewLoader( $Module );
        $this->loaders[$Module->getId()] = $ViewLoader;
        return $ViewLoader;

    }
} 