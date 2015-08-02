<?php

namespace Kontentblocks\Frontend;


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
     * Environment object
     *
     * @var \Kontentblocks\Backend\Environment\Environment
     * @since 0.1.0
     */
    protected $environment;

    /**
     * Class constructor
     *
     * @param $modules
     * @param $environment
     *
     * @since 0.1.0
     */
    public function __construct( $modules, $environment )
    {
        $this->modules = $this->setupModules( $modules );
        $this->environment = $environment;
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
    protected function getModule()
    {
        return $this->modules[$this->key()];
    }

    /**
     * Gets the current positions key
     * @return string
     * @since 0.1.0
     */
    public function key()
    {
        return key( $this->modules );

    }

    /**
     * Advance to next item in array
     *
     * @return void
     * @since 0.1.0
     */
    public function next()
    {
        next( $this->modules );

    }

    /**
     * Reset iterator pointer
     *
     * @return void
     * @since 0.1.0
     */
    public function rewind()
    {
        reset( $this->modules );

    }

    /**
     * Test if key exists
     *
     * @return bool
     * @since 0.1.0
     */
    public function valid()
    {
        return isset( $this->modules[$this->key()] );

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
        if (is_array( $settings['wrapperClasses'] )) {
            return $settings['wrapperClasses'];
        } else {
            return explode( ' ', $settings['wrapperClasses'] );
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
        return count( $this->modules );
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
    public function setPosition( $pos )
    {
        $this->rewind();
        for ($i = 1; $i < $pos; $i ++) {
            $this->next();
        }

        if ($this->valid()) {
            return $this->current();
        }

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
    private function setupModules( $modules )
    {
        $collect = array();
        if (empty( $modules )) {
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
            $collect[$id] = $module;
        }

        return $collect;
    }

}
