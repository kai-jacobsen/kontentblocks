<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Modules\Module;


/**
 * Class ModuleIterator
 *
 *
 * @package Kontentblocks\Frontend
 */
class ModuleIterator implements \Iterator, \Countable
{

    /**
     * Internal pointer
     *
     * @var int
     * @since 0.1.0
     */
    protected $position = 0;

    /**
     * Set of modules to render
     * Result, after filtering the input modules
     *
     * @var array
     * @since 0.1.0
     */
    protected $modules;

    /**
     * The mid for the current position of the iterator
     *
     * @var string
     * @since 0.1.0
     */
    protected $currentModuleId;

    /**
     * current positions module object
     *
     * @var \Kontentblocks\Modules\Module
     * @since 0.1.0
     */
    protected $currentModuleObject;


    /**
     * Class constructor
     *
     * @param $modules
     *
     * @since 0.1.0
     */
    public function __construct($modules)
    {
        $this->modules = $this->setupModules($modules);
    }

    /**
     * Startup filter to sort any invalid modules out
     *
     * @param $modules
     *
     * @return array
     * @filter kb_render_setup_module
     * @since 0.1.0
     */
    private function setupModules($modules)
    {
        $collect = array();
        if (empty($modules)) {
            return $collect;
        }

        foreach ($modules as $id => $module) {
            /*
             * Master modules only
             * --------------------
             */
            // @TODO handle non existing templates better

            // last call to change module args before the instance is instantiated
            // MasterCoreModule will change this to rewrite properties to the original template module
            if (!is_admin() && !$module->verifyRender()){
                continue;
            }
                $collect[$id] = $module;
        }

        return $collect;
    }

    /**
     * Get wrapperclasses for the module wrapper container div
     * @return array
     * @since 0.1.0
     * @TODO: probably not supposed to be here
     */
    public function getCurrentModuleClasses()
    {
        $settings = $this->currentModuleObject->properties->settings;
        if (is_array($settings['wrapperClasses'])) {
            return $settings['wrapperClasses'];
        } else {
            return explode(' ', $settings['wrapperClasses']);
        }

    }

    /**
     * Implementation of countable interface
     *
     * @return int
     * @since 0.1.0
     */
    public function count()
    {
        return count($this->modules);
    }

    /**
     * @param $index
     * @return Module|null
     */
    public function getPosition($index)
    {
        if (isset($this->modules[$index])) {
            return $this->modules[$index];
        }
        return null;
    }

    /**
     * Set the pointer to a specific position and get the module
     *
     * @param $pos
     *
     * @return \Kontentblocks\Modules\Module
     * @since 0.1.0
     * @TODO 'get' would be more appropriate
     */
    public function setPosition($pos)
    {
        $this->rewind();
        for ($i = 1; $i < $pos; $i++) {
            $this->next();
        }

        if ($this->valid()) {
            return $this->current();
        }

    }

    /**
     * Reset iterator pointer
     *
     * @since 0.1.0
     */
    public function rewind()
    {
        return reset($this->modules);

    }

    /**
     * Advance to next item in array
     *
     * @since 0.1.0
     */
    public function next()
    {
        return next($this->modules);

    }

    /**
     * Test if key exists
     *
     * @return bool
     * @since 0.1.0
     */
    public function valid()
    {
        return isset($this->modules[$this->key()]);

    }

    /**
     * Gets the current positions key
     * @return string
     * @since 0.1.0
     */
    public function key()
    {
        return key($this->modules);

    }

    /**
     * Iterators current
     * Wrapper to getModule()
     * sets the internal currentModuleObject property
     *
     * @return \Kontentblocks\Modules\Module
     * @since 0.1.0
     */
    public function current()
    {
        $this->currentModuleObject = $this->getModule();
        return $this->currentModuleObject;

    }

    /**
     * Module getter
     *
     * @return \Kontentblocks\Modules\Module
     * @since 0.1.0
     */
    public function getModule()
    {
        return $this->modules[$this->key()];
    }

    /**
     * @return mixed
     */
    public function prev()
    {
        return prev($this->modules);
    }

    public function getModules()
    {
        return $this->modules;
    }

    public function getModuleCount()
    {
        return count($this->modules);
    }

}
