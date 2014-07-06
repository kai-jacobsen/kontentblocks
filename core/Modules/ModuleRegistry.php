<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Environment\PostEnvironment;
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
        add_action( 'admin_footer', array( $this, 'setupJSON' ), 8 );
    }

    public function add( $file )
    {
        // file should be the full path from the loader
        include_once( $file );

        $classname = str_replace( '.php', '', basename( $file ) );
        if (!isset( $this->modules[$classname] ) && property_exists( $classname, 'defaults' )) {

            // Defaults from the specific Module
            // contains id, name, public name etc..
            $moduleArgs       = array();
            $args             = wp_parse_args( $classname::$defaults, Module::getDefaults() );
            $args['class']    = $classname;
            $args['path']     = trailingslashit( dirname( $file ) );
            $args['uri']      = content_url( str_replace( WP_CONTENT_DIR, '', $args['path'] ) );
            $args['helpfile'] = false;


            if (is_admin()) {
                // setup helpfile
                $locale = get_locale();
                if (file_exists( trailingslashit( $args['path'] ) . $classname . '_' . $locale . '.hbs' )) {
                    $args['helpfile'] = content_url(
                                            str_replace(
                                                WP_CONTENT_DIR,
                                                '',
                                                $args['path']
                                            )
                                        ) . $classname . '_' . $locale . '.hbs';
                }

                if (file_exists( trailingslashit( $args['path'] ) . $classname . '.jpg' )) {
                    $args['poster'] = content_url(
                                          str_replace(
                                              WP_CONTENT_DIR,
                                              '',
                                              $args['path']
                                          )
                                      ) . $classname . '.jpg';
                }

                if (file_exists( trailingslashit( $args['path'] ) . $classname . '.png' )) {
                    $args['poster'] = content_url(
                                          str_replace(
                                              WP_CONTENT_DIR,
                                              '',
                                              $args['path']
                                          )
                                      ) . $classname . '.png';
                }
            }


            // add missing args from general Defaults
            $moduleArgs['settings'] = $args;

            if (!isset( $moduleArgs['state'] )) {
                $moduleArgs['state'] = Module::getDefaultState();
            }
            // Add module to registry
            $this->modules[$classname] = $moduleArgs;
            // Handle connection to regions
            AreaRegistry::getInstance()->connect( $classname, $moduleArgs );
            if (method_exists( $classname, 'init' )) {
                $classname::init( $moduleArgs );
            }
        }

    }

    public function get( $classname )
    {
        if (isset( $this->modules[$classname] )) {
            return $this->modules[$classname];
        } else {
            return null;
            //return new \Exception( 'Cannot get module from collection' );
        }

    }



    public function getAllModules( PostEnvironment $Environment )
    {
        if ($Environment->isPostContext()) {
            return $this->modules;
        } else {
            return array_filter( $this->modules, array( $this, '_filterForGlobalArea' ) );
        }

    }

    public function _filterForGlobalArea( $module )
    {
        if (isset( $module['settings']['globallyAvailable'] ) && $module['settings']['globallyAvailable'] === true) {
            return $module;
        }

    }

    public function getModuleTemplates()
    {
        return array_filter( $this->modules, array( $this, '_filterModuleTemplates' ) );

    }

    private function _filterModuleTemplates( $module )
    {
        if (isset( $module['settings']['asTemplate'] ) && $module['settings']['asTemplate'] == true) {

            return $module;
        }
    }

    /**
     * Get modules which are set to be available
     * by an area.
     *
     * return array
     *
     * @param Area $area
     * @param PostEnvironment $Environment
     *
     * @return array
     */
    public function getValidModulesForArea( Area $area, PostEnvironment $Environment )
    {
        // declare array
        $modules = $this->getAllModules( $Environment );

        if (empty( $modules )) {
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
            if (in_array( $module['settings']['class'], ( array ) $area->assignedModules )) {
                $validModules[$module['settings']['class']] = $module;
            }


            // 'core' modules are assigned anyway
            if ($cat == 'core') {
                $validModules[$module['settings']['class']] = $module;
            }

        }
        //sort alphabetically
        usort( $validModules, array( $this, '_sort_by_name' ) );

        return $validModules;

    }



    /**
     * Usort callback to sort modules alphabetically by name
     *
     * @param array $a
     * @param array $b
     *
     * @return int
     */
    private function _sort_by_name( $a, $b )
    {
        $al = strtolower( $a['settings']['publicName'] );
        $bl = strtolower( $b['settings']['publicName'] );

        if ($al == $bl) {
            return 0;
        }

        return ( $al > $bl ) ? + 1 : - 1;

    }

    public function setupJSON()
    {
        foreach ($this->modules as $classname => $moduleArgs) {
            JSONBridge::getInstance()->registerData( 'ModuleDefinitions', $classname, $moduleArgs );
        }

        // Extra Module Templates
        foreach (ModuleTemplates::getInstance()->getAllTemplates() as $name => $moduleArgs) {
            $moduleClass                   = $moduleArgs['class'];
            $clone                         = wp_parse_args( $moduleArgs, $this->get( $moduleClass ) );
            $clone['settings']['category'] = 'template';
            JSONBridge::getInstance()->registerData( 'ModuleDefinitions', $name, $clone );
        }
    }

    /**
     * array_merge_recursive does indeed merge arrays, but it converts values with duplicate
     * keys to arrays rather than overwriting the value in the first array with the duplicate
     * value in the second array, as array_merge does. I.e., with array_merge_recursive,
     * this happens (documented behavior):
     *
     * array_merge_recursive(array('key' => 'org value'), array('key' => 'new value'));
     *     => array('key' => array('org value', 'new value'));
     *
     * arrayMergeRecursiveDistinct does not change the datatypes of the values in the arrays.
     * Matching keys' values in the second array overwrite those in the first array, as is the
     * case with array_merge, i.e.:
     *
     * arrayMergeRecursiveDistinct(array('key' => 'org value'), array('key' => 'new value'));
     *     => array('key' => array('new value'));
     *
     * Parameters are passed by reference, though only for performance reasons. They're not
     * altered by this function.
     *
     * If key is integer, it will be merged like array_merge do:
     * arrayMergeRecursiveDistinct(array(0 => 'org value'), array(0 => 'new value'));
     *     => array(0 => 'org value', 1 => 'new value');
     *
     * @param array $array1
     * @param array $array2
     * @return array
     * @author Daniel <daniel (at) danielsmedegaardbuus (dot) dk>
     * @author Gabriel Sobrinho <gabriel (dot) sobrinho (at) gmail (dot) com>
     * @author Anton Medvedev <anton (at) elfet (dot) ru>
     */
    protected function arrayMergeRecursiveDistinct(array &$array1, array &$array2)
    {
        $merged = $array1;

        foreach ($array2 as $key => &$value) {
            if (is_array($value) && isset ($merged[$key]) && is_array($merged[$key])) {
                if (is_int($key)) {
                    $merged[] = $this->arrayMergeRecursiveDistinct($merged[$key], $value);
                } else {
                    $merged[$key] = $this->arrayMergeRecursiveDistinct($merged[$key], $value);
                }
            } else {
                if (is_int($key)) {
                    $merged[] = $value;
                } elseif (is_null($merged[$key])) {
                    $merged[$key] = $value;
                }
            }
        }

        return $merged;
    }
}
