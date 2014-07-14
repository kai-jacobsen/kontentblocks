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

        $FileSystem              = new ModuleViewFilesystem( $Module );
        $this->views[$classname] = $FileSystem;
        return $FileSystem;

    }

    public function getViewLoader( Module $Module )
    {
        $classname = get_class( $Module );
        if (isset( $this->loaders[$classname] )) {
            return $this->loaders[$classname];
        }

        $ViewLoader                = new ModuleViewLoader( $Module );
        $this->loaders[$classname] = $ViewLoader;
        return $ViewLoader;

    }
} 