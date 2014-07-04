<?php

namespace Kontentblocks\Modules;


class ModuleViewsRegistry
{

    static $instance;
    protected $views = array();
    protected $loaders = array();

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;

    }

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