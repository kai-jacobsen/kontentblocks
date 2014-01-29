<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Utils\JSONBridge;

class ModuleRegistry
{

    static $instance;
    public $modules = array();

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    private function __construct()
    {
        add_action('admin_footer', array($this, 'setupJSON'), 8);
    }

    public function add($file)
    {
        // file should be the full path from the loader
        // @todo | done | replace module reflection class path getting with this to save ressources
        include_once($file);

        $classname = str_replace('.php', '', basename($file));

        if (!isset($this->modules['classname']) && property_exists($classname, 'defaults')) {
            // Defaults from the specific Module
            // contains id, name, public name etc..
            $moduleArgs = array();
            $args = $classname::$defaults;
            $args['class'] = $classname;
            $args['path'] = trailingslashit(dirname($file));
            $args['helpfile'] = false;
            // setup helpfile
            if (file_exists(trailingslashit($args['path']) . $classname . '.html')) {
                $args['helpfile'] = content_url(str_replace(WP_CONTENT_DIR, '', $args['path'])) . $classname . '.html';
            }
            // add missing args from general Defaults
            $moduleArgs['settings'] = wp_parse_args($args, Module::getDefaults());
            if (!isset($moduleArgs['state'])) {
                $moduleArgs['state'] = Module::getDefaultState();
            }
            // Add module to registry
            $this->modules[$classname] = $moduleArgs;
            // Handle connection to regions
            AreaRegistry::getInstance()->connect($classname, $moduleArgs);

        }

    }

    public function get($classname)
    {
        if (isset($this->modules[$classname])) {
            return $this->modules[$classname];
        } else {
            return null;
            //return new \Exception( 'Cannot get module from collection' );
        }

    }

    public function getAllModules(AbstractEnvironment $dataContainer)
    {
        if ($dataContainer->isPostContext()) {
            return $this->modules;
        } else {
            return array_filter($this->modules, array($this, '_filterForGlobalArea'));
        }

    }

    public function _filterForGlobalArea($module)
    {
        if (isset($module['settings']['globallyAvailable']) && $module['settings']['globallyAvailable'] === true) {
            return $module;
        }

    }

    public function getModuleTemplates()
    {
        return array_filter($this->modules, array($this, '_filterModuleTemplates'));

    }

    private function _filterModuleTemplates($module)
    {
        if (isset($module['settings']['asTemplate']) && $module['settings']['asTemplate'] == true) {

            return $module;
        }
    }

    /**
     * Get modules which are set to be available
     * by an area.
     *
     * return array
     */
    public function getValidModulesForArea(Area $area, AbstractEnvironment $environment)
    {
        // declare array
        $modules = $this->getAllModules($environment);

        if (empty($modules)) {
            return false;
        }

        $validModules = array();

        foreach ($modules as $module) {

            // disabled modules are not added
            if ($module['settings']['disabled']) {
                continue;
            }

            // todo: possible a mistake
            // hidden modules are not added
            if ($module['settings']['hidden']) {
                continue;
            }

            // shorthand category
            $cat = $module['settings']['category'];

            // Module has to be assigned to area, either by area definition or through module 'connect'
            if (in_array($module['settings']['class'], ( array )$area->assignedModules)) {
                $validModules[$module['settings']['class']] = $module;
            }


            // 'core' modules are assigned anyway
            if ($cat == 'core') {
                $validModules[$module['settings']['class']] = $module;
            }

        }
        //sort alphabetically
        usort($validModules, array($this, '_sort_by_name'));

        return $validModules;

    }

    /**
     * Usort callback to sort modules alphabetically by name
     * @param array $a
     * @param array $b
     * @return int
     */
    private function _sort_by_name($a, $b)
    {
        $al = strtolower($a['settings']['public_name']);
        $bl = strtolower($b['settings']['public_name']);

        if ($al == $bl) {
            return 0;
        }
        return ($al > $bl) ? +1 : -1;

    }

    public function setupJSON()
    {
        foreach ($this->modules as $classname => $moduleArgs) {
            JSONBridge::getInstance()->registerData('ModuleDefinitions', $classname, $moduleArgs);
        }

        $tpldefs = ModuleTemplates::getInstance()->getAllTemplates();
        foreach (ModuleTemplates::getInstance()->getAllTemplateModules() as $name => $moduleArgs) {
            $moduleClass = $moduleArgs['class'];
            $clone = wp_parse_args($moduleArgs, $this->get($moduleClass));
            $clone['settings']['category'] = 'template';
            $clone['tpldef'] = $tpldefs[$name];
            JSONBridge::getInstance()->registerData('ModuleDefinitions', $name, $clone);
        }
    }

}
