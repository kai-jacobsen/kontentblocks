<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;

/**
 * Class ModuleViewLoader
 * @package Kontentblocks\Modules
 */
class ModuleViewManager
{

    /**
     * found views
     * @var array
     */
    public $views;
    /**
     *
     * @var \Kontentblocks\Modules\ModuleViewFilesystem
     */
    protected $viewFilesystem;
    /**
     * Flag views
     * @var bool
     */
    protected $hasViews = false;

    /**
     * The Module
     * @var Module
     */
    private $module;

    /**
     * Class constructor
     *
     * @param Module $module
     * @param ModuleViewFilesystem $filesystem
     */
    public function __construct(Module $module, ModuleViewFilesystem $filesystem)
    {
        $this->viewFilesystem = $filesystem;
        $this->module = $module;
        $this->views = $this->updateViews();

        /**
         * register handler to save the user choice when the frontend edit module saves
         */
        add_action('kb.save.frontend.module', array($this, 'frontendSave'));
    }

    /**
     * @return array
     */
    public function updateViews(){
        $views = $this->viewFilesystem->getTemplatesforContext($this->module->getContext());
        if (count($views) > 1) {
            $this->hasViews = true;
        } else{
            $this->hasViews = false;
        }
        $this->views = $views;
        return $this->views;
    }

    /**
     * Check if files are available
     * @return bool
     */
    public function hasViews()
    {
        return $this->hasViews;
    }

    public function getPreview()
    {
        return $this->viewFilesystem->getPreview();
    }

    /**
     * Lookup the default viewfile to use.
     * A module can specify the default template by implementing 'defaultView'
     * That method must return a valid .twig file in the paths of the loader
     *
     * the first view in the found viewfiles is returned as fallback
     * @return string
     */
    public function findDefaultTemplate()
    {
        $keys = array_values($this->views);
        if (method_exists($this->module, 'defaultView')) {
            $setByModule = $this->module->defaultView();
            if (!empty($setByModule) && $this->isValidTemplate($setByModule)) {
                return $setByModule;
            } elseif (isset($keys[0])) {
                $first = $keys[0];
                return $first->filename;
            }
        } elseif (isset($keys[0])) {
            $first = $keys[0];
            return $first->filename;
        } else {
            return null;
        }
    }

    /**
     * Test if the file returned by a modules 'defaultView' method is valid
     *
     * @param $setByModule
     *
     * @return bool
     */
    public function isValidTemplate($setByModule)
    {

        foreach ($this->views as $view) {
            if ($setByModule === $view->filename) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array
     */
    public function getViews()
    {
        return $this->views;
    }

    /**
     * @param $name
     *
     * @return null
     */
    public function getViewByName($name)
    {
        if (isset($this->views[$name])) {
            return $this->views[$name];
        } else {
            return null;
        }
    }

    /**
     * Callback handler, when the viewfile gets changed on the frontend
     *
     * @param $module
     * @return null
     */
    public function frontendSave(Module $module)
    {
        $viewfile = $module->getViewfile();
        if (empty($viewfile)) {
            return null;
        }
        $postId = $module->properties->postId;
        /** @var \Kontentblocks\Backend\Storage\ModuleStorage $storage */
        $storage = new ModuleStorage($postId);
        $index = $storage->getModuleDefinition($module->getId());
        $index['viewfile'] = $viewfile;
        $storage->addToIndex($module->getId(), $index);
    }

    /**
     * @return ModuleViewFilesystem
     */
    public function getFileSystem()
    {
        return $this->viewFilesystem;
    }
} 