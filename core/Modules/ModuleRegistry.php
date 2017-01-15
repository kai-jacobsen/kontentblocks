<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Common\Data\YAMLLoader;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;
use Pimple\Container;

/**
 * Class ModuleRegistry
 * @package Kontentblocks\Modules
 */
class ModuleRegistry
{
    /**
     * Collection of Module definitions
     * @var array
     */
    public $modules = array();

    /**
     * @var Container
     */
    private $services;

    /**
     * Constructor
     * Gets instantiated by pimple once
     * @param Container $services
     */
    public function __construct(Container $services)
    {
        $this->services = $services;
        add_action('admin_footer', array($this, 'setupJSON'), 8);

        if (is_user_logged_in()) {
            add_action('wp_footer', array($this, 'setupJSON'), 8);
        }
    }

    /**
     * Add a module from loader by file
     * Extends the loaded module defaults and adds path specific
     * attributes
     * @param $file
     */
    public function add($file)
    {
        include_once $file;
        // extract class name from directory
        $classname = basename(dirname($file));
        if (!isset($this->modules[$classname])) {
            // Defaults from the specific Module
            // contains id, name, public name etc..
            $moduleArgs = array();

            $args = $this->setupSettings($file, $classname);

            if (is_admin()) {
                $args = $this->setupFilePaths($args, $classname);
            }

            // settings array
            $moduleArgs['settings'] = $args;

            // Add module to registry
            $this->modules[$classname] = $moduleArgs;

            // Handle connection to regions
            /** @var \Kontentblocks\Areas\AreaRegistry $areaRegistry */
            $areaRegistry = $this->services['registry.areas'];
            $areaRegistry->connect($classname, $moduleArgs);
            // call static init method, if present
            if (method_exists($classname, 'init')) {
                $classname::init($moduleArgs);
            }
        }
    }

    /**
     * @param $file
     * @param $classname
     * @return array
     */
    private function setupSettings($file, $classname)
    {

        $args = Module::getDefaultSettings();
        if (property_exists($classname, 'settings')) {
            $args = wp_parse_args($classname::$settings, $args);
        }

        $args['class'] = $classname;
        $args['hash'] = md5($classname);
        $args['path'] = trailingslashit(dirname($file));
        $args['uri'] = content_url(str_replace(WP_CONTENT_DIR, '', $args['path']));
        $args['helptext'] = false;

        $settingsfile = trailingslashit($args['path']) . 'settings.yml';
        $yamlSettings = new YAMLLoader($settingsfile);
        if ($yamlSettings->isValid()) {
            $args = Utilities::arrayMergeRecursive($yamlSettings->data, $args);
        }
        $args['publicName'] = (empty($args['publicName'])) ? $args['name'] : $args['publicName'];

        if (!empty($args['id']) && empty($args['slug'])) {
            $args['slug'] = $args['id'];
        }

        if (empty($args['slug'])) {
            $args['slug'] = sanitize_title($args['class']);
        }

        return $args;

    }

    /**
     * @param $args
     * @param $classname
     * @return mixed
     */
    private function setupFilePaths($args, $classname)
    {

        if (file_exists(trailingslashit($args['path']) . $classname . '.jpg')) {
            $args['poster'] = content_url(
                                  str_replace(
                                      WP_CONTENT_DIR,
                                      '',
                                      $args['path']
                                  )
                              ) . $classname . '.jpg';
        }

        if (file_exists(trailingslashit($args['path']) . $classname . '.png')) {
            $args['poster'] = content_url(
                                  str_replace(
                                      WP_CONTENT_DIR,
                                      '',
                                      $args['path']
                                  )
                              ) . $classname . '.png';
        }

        return $args;
    }

    /**
     * Getter for all modules
     * @return array
     */
    public function getAll()
    {
        return $this->modules;
    }

    /**
     * Make raw definitions available to js
     */
    public function setupJSON()
    {
        foreach ($this->modules as $classname => $moduleArgs) {
            Kontentblocks::getService('utility.jsontransport')->registerData(
                'ModuleDefinitions',
                $classname,
                $moduleArgs
            );
        }

        // Extra global modules
        foreach (GlobalModules::getInstance()->getAllGmodules() as $id => $moduleArgs) {
            $moduleClass = $moduleArgs['class'];
            $clone = wp_parse_args($moduleArgs, $this->get($moduleClass));
            $clone['settings']['category'] = 'gmodule';
            Kontentblocks::getService('utility.jsontransport')->registerData('ModuleDefinitions', $id, $clone);
        }
    }

    /**
     *
     * @param $classname
     *
     * @return null
     */
    public function get($classname)
    {
        if (isset($this->modules[$classname])) {
            return $this->modules[$classname];
        } else {
            return null;
            //return new \Exception( 'Cannot get module from collection' );
        }
    }

}
