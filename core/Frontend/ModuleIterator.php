<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Language\I18n;

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
     * @since 1.0.0
     */
    protected $position = 0;

    /**
     * Set of modules to render
     * Result, after filtering the input modules
     *
     * @var array
     * @since 1.0.0
     */
    protected $modules;

    /**
     * The instance_id for the current position of the iterator
     *
     * @var string
     * @since 1.0.0
     */
    protected $currentModuleId;

    /**
     * current positions module object
     *
     * @var \Kontentblocks\Modules\Module
     * @since 1.0.0
     */
    protected $currentModuleObject;


    /**
     * Environment object
     *
     * @var \Kontentblocks\Abstracts\AbstractEnvironment
     * @since 1.0.0
     */
    protected $Environment;

    /**
     * Class constructor
     *
     * @param $modules
     * @param $Environment
     * @since 1.0.0
     */
    public function __construct($modules, $Environment)
    {
        $this->modules = $this->setupModules($modules);
        $this->Environment = $Environment;

    }

    /**
     * Iterators current
     * Wrapper to getModule()
     * sets the internal currentModuleObject property
     *
     * @return \Kontentblocks\Modules\Module
     * @since 1.0.0
     */
    public function current()
    {
        $this->currentModuleObject = $this->getModule();
        return $this->currentModuleObject;

    }

    /**
     * Factory Wrapper
     *
     * @return \Kontentblocks\Modules\Module
     * @since 1.0.0
     */
    protected function getModule()
    {
        $moduleDef = $this->modules[$this->key()];
        $Factory = new \Kontentblocks\Modules\ModuleFactory(
            $moduleDef['class'], $moduleDef, $this->Environment, $this->getModuleData($moduleDef));
        return $Factory->getModule();

    }

    /**
     * Gets the current positions key
     * @return string
     * @since 1.0.0
     */
    public function key()
    {
        return key($this->modules);

    }

    /**
     * Advance to next item in array
     *
     * @return void
     * @since 1.0.0
     */
    public function next()
    {
        next($this->modules);

    }

    /**
     * Reset iterator pointer
     *
     * @return void
     * @since 1.0.0
     */
    public function rewind()
    {
        reset($this->modules);

    }

    /**
     * Test if key exists
     *
     * @return bool
     * @since 1.0.0
     */
    public function valid()
    {
        return isset($this->modules[$this->key()]);

    }

    /**
     * Get wrapperclasses for the module wrapper container div
     * @return array
     * @since 1.0.0
     * @TODO: probably not supposed to be here
     */
    public function getCurrentModuleClasses()
    {
        $settings = $this->currentModuleObject->settings;
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
     * @since 1.0.0
     */
    public function count()
    {
        return count($this->modules);
    }


    /**
     * Set the pointer to a specific position and get the module
     *
     * @param $pos
     * @return \Kontentblocks\Modules\Module
     * @since 1.0.0
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
     * Startup filter to sort any invalid modules out
     *
     * @param $modules
     * @return array
     * @since 1.0.0
     */
    private function setupModules($modules)
    {
        $collect = array();

        foreach ($modules as $id => $module) {

            // if module is a draft or marked as inactive
            if ($module['state']['draft'] || !$module['state']['active'] ) {
                continue;
            }


            /*
             * Master modules only
             * --------------------
             */
            // @TODO handle non existing templates better
            // @TODO Move this to a filter inside the actual module!!!11!
            if (isset($module['master']) && $module['master']) {
                $API = new PluginDataAPI('tpldata');
                $tpl = $module['tpldef'];

                // if module has it's own translation, check if the module still exist
                if (isset($module['overrides']['translated']) && $module['overrides']['translated']) {
                    if (!$API->keyExists($tpl['data_key'])) {
                        continue;
                    }
                    // if module is still bound to it's origin ( in case of wpml duplicate) check if the original still exist
                } else {
                    I18n::getInstance()->wpmlActive() && $API->setLang($tpl['data_lang']);
                    if (!$API->keyExists($tpl['data_key'])) {
                        continue;
                    }
                }

                $this->data = $API->get($tpl['data_key']);

                $tpldef = maybe_unserialize($tpl['data_value']);
                $args = \Kontentblocks\Modules\ModuleRegistry::getInstance()->get($tpldef['type']);
                $args['instance_id'] = $module['instance_id'];
                $args['overrides'] = $module['overrides'];
                $args['area'] = $module['area'];
                $args['class'] = $tpldef['type'];
                $args['areaContext'] = $module['areaContext'];
                $args['state'] = $module['state'];
                $args['tpldef'] = $module['tpldef'];
                $args['master'] = true;
                $module = $args;
            }

            $collect[$id] = $module;
        }

        return $collect;
    }

    /**
     * Get the data for the current a module
     * @param $moduleDef
     * @return array|mixed|null
     * @since 1.0.0
     * @TODO add filter and move master module stuff somewhere else
     */
    private function getModuleData($moduleDef)
    {
        if ($moduleDef['master']) {
            return $this->getMasterModuleData($moduleDef);
        } else {
            return $this->Environment->getModuleData($this->key());
        }
    }

    /**
     * Get data for master modules
     * @param $moduleDef
     * @return array|mixed|null
     * @TODO move somewhere else
     */
    private function getMasterModuleData($moduleDef)
    {
        $tpl = $moduleDef['tpldef'];
        // Check if there is data
        $API = new PluginDataAPI('tpldata');
        $data = $API->get($tpl['data_key']);
        $I18n = I18n::getInstance();
        if (is_null($data) && $I18n->wpmlActive()) {
            if ($tpl['data_lang'] !== $I18n->getActiveLanguage()) {
                $API->setLang($tpl['data_lang']);
                $data = $API->get($tpl['data_key']);
            }
        }

        if (is_null($data)) {
            return array();
        } else {
            return $data;
        }
    }

}
