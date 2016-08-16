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

//    /**
//     * array_merge_recursive does indeed merge arrays, but it converts values with duplicate
//     * keys to arrays rather than overwriting the value in the first array with the duplicate
//     * value in the second array, as array_merge does. I.e., with array_merge_recursive,
//     * this happens (documented behavior):
//     *
//     * array_merge_recursive(array('key' => 'org value'), array('key' => 'new value'));
//     *     => array('key' => array('org value', 'new value'));
//     *
//     * arrayMergeRecursiveDistinct does not change the datatypes of the values in the arrays.
//     * Matching keys' values in the second array overwrite those in the first array, as is the
//     * case with array_merge, i.e.:
//     *
//     * arrayMergeRecursiveDistinct(array('key' => 'org value'), array('key' => 'new value'));
//     *     => array('key' => array('new value'));
//     *
//     * Parameters are passed by reference, though only for performance reasons. They're not
//     * altered by this function.
//     *
//     * If key is integer, it will be merged like array_merge do:
//     * arrayMergeRecursiveDistinct(array(0 => 'org value'), array(0 => 'new value'));
//     *     => array(0 => 'org value', 1 => 'new value');
//     *
//     * @param array $array1
//     * @param array $array2
//     *
//     * @return array
//     * @author Daniel <daniel (at) danielsmedegaardbuus (dot) dk>
//     * @author Gabriel Sobrinho <gabriel (dot) sobrinho (at) gmail (dot) com>
//     * @author Anton Medvedev <anton (at) elfet (dot) ru>
//     */
//    protected function arrayMergeRecursiveDistinct(array &$array1, array &$array2)
//    {
//        $merged = $array1;
//
//        foreach ($array2 as $key => &$value) {
//            if (is_array($value) && isset ($merged[$key]) && is_array($merged[$key])) {
//                if (is_int($key)) {
//                    $merged[] = $this->arrayMergeRecursiveDistinct($merged[$key], $value);
//                } else {
//                    $merged[$key] = $this->arrayMergeRecursiveDistinct($merged[$key], $value);
//                }
//            } else {
//                if (is_int($key)) {
//                    $merged[] = $value;
//                } elseif (is_null($merged[$key])) {
//                    $merged[$key] = $value;
//                }
//            }
//        }
//
//        return $merged;
//    }
}
