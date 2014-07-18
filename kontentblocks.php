<?php
/*
  Plugin Name: Kontentblocks
  Plugin URI: http://kontentblocks.de
  Description: Modularize content
  Version: 1.0.0-alpha
  Author: Kai Jacobsen
  Author URI: http://kontentblocks.de
  Text Domain: Kontentblocks
  Domain Path: /languages
  License: GPL3
 */

namespace Kontentblocks;

use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Backend\Dynamic\DynamicAreas;
use Kontentblocks\Backend\Dynamic\ModuleTemplates;
use Kontentblocks\Backend\Screen\EditScreen;
use Kontentblocks\Hooks\Enqueues;
use Kontentblocks\Hooks\Capabilities;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Modules\ModuleViewsRegistry;
use Kontentblocks\Templating\Twig;
use Pimple;


/**
 * Class Kontentblocks
 * @package Kontentblocks
 */
Class Kontentblocks
{

    const VERSION = '1.0.0alpha';
    const DEVMODE = true;
    const TABLEVERSION = '1.0.13';
    const CONTENTCONCAT = true;

    public $Services;

    public $dev_mode = true;
    static $instance;

    public static function getInstance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new static();
        }

        return $instance;
    }

    /**
     *
     */
    public function __construct()
    {
        self::bootstrap();

        $this->Services = new Pimple\Container();

        $this->setupTemplating();
        $this->setupRegistries();

        // load modules automatically, after dynamic areas were setup,
        // dynamic areas are on init/initInterface hook
        add_action( 'kb::setup.areas', array( $this, 'loadModules' ), 9 );

        add_action( 'after_setup_theme', array( $this, 'setup' ), 11 );
//
//        // Load Plugins
//        add_action( 'init', array( $this, 'loadExtensions' ), 9 );
//
//        // Load Fields
//        add_action( 'init', array( $this, 'loadFields' ), 9 );
//
//        add_action( 'init', array( $this, 'initInterface' ), 9 );


        if (defined( 'WP_LOCAL_DEV' ) && WP_LOCAL_DEV) {
            add_action( 'wp_head', array( $this, 'livereload' ) );
            add_action( 'admin_head', array( $this, 'livereload' ) );
        }

        add_action( 'plugins_loaded', array( $this, 'i18n' ) );

    }

    public function setup()
    {
        require_once dirname( __FILE__ ) . '/core/Hooks/setup.php';

        if (file_exists( get_template_directory() . '/kontentblocks.php' )) {
            include_once( get_template_directory() . '/kontentblocks.php' );
        }

        if (is_child_theme() && file_exists( get_stylesheet_directory() . '/kontentblocks.php' )) {
            include_once( get_stylesheet_directory() . '/kontentblocks.php' );
        }

        if (current_theme_supports( 'kontentblocks' )) {

            // Enqueues of front and backend scripts and styles is handled here
            // earliest hook: init
            Enqueues::setup();

            $this->loadExtensions();
            $this->loadFields();
            $this->initInterface();

            // enabled for 'page' by default
            add_post_type_support( 'page', 'kontentblocks' );
            remove_post_type_support( 'page', 'revisions' );
            do_action( 'kb:init' );

        }

    }

    /**
     * Add livereload script
     * Only loaded if WP_LOCAL_DEV is true
     */
    public function livereload()
    {
        echo '<script src="http://localhost:35729/livereload.js"></script>';
    }

    /**
     *
     */
    public function initInterface()
    {

        /*
         * ----------------
         * Admin menus & custom post types
         * ----------------
         */
        // global areas post type and menu page management
        new DynamicAreas();
        // global templates post type and menu management
        new ModuleTemplates();

        /*
         * Main post edit screen handler
         * Post type must support 'kontentblocks"
         */
        new EditScreen();
    }

    public function i18n()
    {
        load_plugin_textdomain( 'Kontentblocks', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
        Language\I18n::getInstance();

    }


    /**
     * Load Module Files
     * Simply auto-includes all .php files inside the templates folder
     *
     * uses filter: kb_template_paths to register / modify path array from the outside
     */
    public function loadModules()
    {
        /** @var \Kontentblocks\Modules\ModuleRegistry $Registry */
        $Registry = $this->Services['registry.modules'];
        // add core modules path
        $paths = array( KB_TEMPLATE_PATH );
        // deprecated
        $paths = apply_filters( 'kb_add_template_path', $paths );
        // replacement for '_add_template_path'
        $paths = apply_filters( 'kb::add.module.path', $paths );
        // legacy
        $paths = apply_filters( 'kb_add_module_path', $paths );
        foreach ($paths as $path) {
            $dirs = glob( $path . '[mM]odule*', GLOB_ONLYDIR );
            if (!empty( $dirs )) {
                foreach ($dirs as $subdir) {
                    $files = glob( $subdir . '/[mM]odule*.php' );
                    foreach ($files as $template) {
                        if (strpos( basename( $template ), '__' ) === false) {
                            $Registry->add( $template );
                        }
                    }
                }
            }
            $files = glob( $path . '*.php' );
            foreach ($files as $template) {
                if (strpos( basename( $template ), '__' ) === false) {
                    $Registry->add( $template );
                }
            }
        }
    }

    /**
     * Load Extensions
     * @since 1.0.0
     */
    public function loadExtensions()
    {

        include_once 'core/Extensions/ExtensionsBootstrap.php';
//        $paths = array( kb_get_plugin_path() );
//        $paths[] = plugin_dir_path( __FILE__ ) . '/helper/';
//        $paths = apply_filters( 'kb::add.plugin.path', $paths );
//
//        foreach ($paths as $path) {
//            //take care of dirs
//            foreach (glob( $path . "*", GLOB_ONLYDIR ) as $filename) {
//                $base = basename( $filename );
//                if (file_exists( trailingslashit( $filename ) . $base . '.php' )) {
//                    include_once( $filename . $base . '.php' );
//
//                }
//            }
//
//            // take care of files
//            $files = glob( $path . '*.php' );
//            foreach ($files as $template) {
//                include_once( $template );
//            }
//        }

        do_action( 'kb::init' );

    }

    /**
     *  Load Field Definitions
     */
    public function loadFields()
    {
        foreach (glob( KB_PLUGIN_PATH . 'core/Fields/Definitions/*.php' ) as $file) {
            $this->Services['registry.fields']->add( $file );
        }
    }


    /**
     * Define constants and require additional files
     */
    private static function bootstrap()
    {
        define( 'KB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
        define( 'KB_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
        define( 'KB_TEMPLATE_URL', plugin_dir_url( __FILE__ ) . '/core/Modules/Core/' );
        define( 'KB_TEMPLATE_PATH', plugin_dir_path( __FILE__ ) . 'core/Modules/Core/' );
        define( 'KB_REFIELD_JS', plugin_dir_url( __FILE__ ) . '/Definitions/js/' );
        // still there for historical reasons
        define( 'KONTENTLOCK', false );

        // Composer autoloader, depends on composer setup
        if (file_exists( dirname( __FILE__ ) ) . '/vendor/autoload.php') {
            require_once dirname( __FILE__ ) . '/vendor/autoload.php';
        }
        // Kontentblocks autloader
        require_once dirname( __FILE__ ) . '/Autoloader.php';
        // Public API
        require_once dirname( __FILE__ ) . '/includes/wp-api.php';
        require_once dirname( __FILE__ ) . '/includes/kb-api.php';

        // File gets created during build process and contains one function
        // to get the current git hash or a random hash during development
        // hash is used to invalidate the local storage data
        if (file_exists( dirname( __FILE__ ) . '/build/hash.php' )) {
            require_once( dirname( __FILE__ ) . '/build/hash.php' );
        }

        /* Include all necessary files on admin area */
        if (is_admin()) {
            require_once dirname( __FILE__ ) . '/core/Utils/tables.php';
        }
        require_once dirname( __FILE__ ) . '/includes/ajax-callback-handler.php';

    }

    public static function onActivation()
    {

        if (!is_dir( get_template_directory() . '/module-templates' )) {
            mkdir( get_template_directory() . '/module-templates', 0775, true );
        }

        if (is_child_theme()) {
            if (!is_dir( get_stylesheet_directory() . '/module-templates' )) {
                mkdir( get_stylesheet_directory() . '/module-templates', 0775, true );
            }
        }

        Capabilities::setup();

    }

    public static function onDeactivation()
    {
        delete_transient( 'kb_last_backup' );
        delete_option( 'kb_dbVersion' );
    }

    public static function onUnistall()
    {
        global $wpdb;
        $table = $wpdb->prefix . "kb_backups";
        $wpdb->query( "DROP TABLE IF EXISTS $table" );
    }

    private function setupTemplating()
    {
        // pimpled
        $this->Services['templating.twig.loader'] = function ( $container ) {
            return Twig::setupLoader( $container );
        };

        $this->Services['templating.twig'] = function ( $container ) {
            return Twig::setupEnvironment( $container );
        };
    }

    private function setupRegistries()
    {
        $this->Services['registry.modules'] = function ( $Services ) {
            return new ModuleRegistry( $Services );
        };
        $this->Services['registry.areas'] = function ( $Services ) {
            return new AreaRegistry( $Services );
        };
        $this->Services['registry.moduleViews'] = function ( $Services ) {
            return new ModuleViewsRegistry( $Services );
        };
        $this->Services['registry.fields'] = function ( $Services ) {
            return new FieldRegistry( $Services );
        };
    }

    public static function getService( $service )
    {
        return Kontentblocks::getInstance()->Services[$service];
    }

    public static function addService( $service, $callable )
    {
        Kontentblocks::getInstance()->Services[$service] = $callable;
    }


}

// end Kontentblocks

// Fire it up
Kontentblocks::getInstance();

register_activation_hook( __FILE__, array( '\Kontentblocks\Kontentblocks', 'onActivation' ) );
register_deactivation_hook( __FILE__, array( '\Kontentblocks\Kontentblocks', 'onDeactivation' ) );
register_uninstall_hook( __FILE__, array( '\Kontentblocks\Kontentblocks', 'onUninstall' ) );