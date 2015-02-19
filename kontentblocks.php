<?php
/*
  Plugin Name: Kontentblocks
  Plugin URI: http://kontentblocks.de
  Description: Content modularization framework
  Version: 1.0.0-alpha
  Author: Kai Jacobsen
  Author URI: http://kontentblocks.de
  Text Domain: Kontentblocks
  Domain Path: /languages
  License: GPL3
 */

namespace Kontentblocks;

use Detection\MobileDetect;
use Kontentblocks\Ajax\AjaxCallbackHandler;
use Kontentblocks\Areas\AreaRegistry;
use Kontentblocks\Backend\Dynamic\DynamicAreas;
use Kontentblocks\Backend\Dynamic\ModuleTemplates;
use Kontentblocks\Backend\Screen\EditScreen;
use Kontentblocks\Hooks\Enqueues;
use Kontentblocks\Hooks\Capabilities;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Modules\ModuleViewsRegistry;
use Kontentblocks\Panels\PanelRegistry;
use Kontentblocks\Templating\Twig;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\JSONTransport;
use Monolog\Handler\BrowserConsoleHandler;
use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use Pimple;
use Reframe\Autoloader;


/**
 * Class Kontentblocks
 * @package Kontentblocks
 */
Class Kontentblocks
{

    const VERSION = '1.0.0alpha';
    const DEVMODE = true;
    const TABLEVERSION = '1.0.13';
    const DEBUG = true;
    const DEBUG_LOG = false;

    public $Services;

    static $instance;
    static $AjaxHandler;

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
        // setup services
        $this->setupTemplating();
        $this->setupRegistries();
        $this->setupUtilities();

        // load modules automatically, after areas were setup,
        // dynamic areas are on init/initInterface hook
        add_action( 'kb.areas.setup', array( $this, 'loadModules' ), 9 );
        add_action( 'after_setup_theme', array( $this, 'setup' ), 11 );
    }

    public function setup()
    {
        require_once dirname( __FILE__ ) . '/core/Hooks/setup.php';
        Capabilities::setup();

        if (file_exists( get_template_directory() . '/kontentblocks.php' )) {
            add_theme_support( 'kontentblocks' );
            include_once( get_template_directory() . '/kontentblocks.php' );
            _K::info( 'kontentblocks.php loaded from main theme' );

        }

        if (is_child_theme() && file_exists( get_stylesheet_directory() . '/kontentblocks.php' )) {
            add_theme_support( 'kontentblocks' );
            include_once( get_stylesheet_directory() . '/kontentblocks.php' );
            _K::info( 'kontentblocks.php loaded from childtheme' );
        }


        if (current_theme_supports( 'kontentblocks' )) {
            // Enqueues of front and backend scripts and styles is handled here
            // earliest hook: init
            Enqueues::setup();
            $this->i18n();
            $this->loadExtensions();
            $this->loadFields();
            $this->initInterface();

            // enabled for 'page' by default
            add_post_type_support( 'page', 'kontentblocks' );
            remove_post_type_support( 'page', 'revisions' );
        }

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
        $paths = apply_filters( 'kb.module.paths', $paths );
        $paths = array_unique( $paths );
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
        _K::info( 'Modules loaded' );

        do_action( 'kb.init' );
        _K::info( 'kb.init action fired. We\'re good to go.' );

    }

    /**
     * Load Extensions
     * @since 1.0.0
     */
    public function loadExtensions()
    {
        include_once 'core/Extensions/ExtensionsBootstrap.php';
    }

    /**
     *  Load Field Definitions
     */
    public function loadFields()
    {
        foreach (glob( KB_PLUGIN_PATH . 'core/Fields/Definitions/*.php' ) as $file) {
            $this->Services['registry.fields']->add( $file );
        }

        _K::info( 'Fields loaded' );
    }


    /**
     * Define constants and require additional files
     */
    private static function bootstrap()
    {
        define( 'KB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
        define( 'KB_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
        define( 'KB_TEMPLATE_URL', plugin_dir_url( __FILE__ ) . 'core/Modules/Core/' );
        define( 'KB_TEMPLATE_PATH', plugin_dir_path( __FILE__ ) . 'core/Modules/Core/' );
        define( 'KB_REFIELD_JS', plugin_dir_url( __FILE__ ) . 'core/Fields/Definitions/js/' );
        // still there for historical reasons
        define( 'KONTENTLOCK', false );

        // Composer autoloader, depends on composer setup
        if (file_exists( dirname( __FILE__ ) ) . '/vendor/autoload.php') {
            require_once dirname( __FILE__ ) . '/vendor/autoload.php';
        }
        // Kontentblocks autloader
//        require_once dirname( __FILE__ ) . '/Autoloader.php';
        // Public API
        require_once dirname( __FILE__ ) . '/includes/wp-api.php';
        require_once dirname( __FILE__ ) . '/includes/kb-api.php';

        // File gets created during build process and contains one function
        // to get the current git hash or a random hash during development
        // hash is used to invalidate the local storage data
        if (file_exists( dirname( __FILE__ ) . '/build/hash.php' )) {
            require_once( dirname( __FILE__ ) . '/build/hash.php' );
        }

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

        include_once 'Autoloader.php';
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

        $this->Services['templating.twig.public'] = function ( $container ) {
            return Twig::setupEnvironment( $container );
        };

        $this->Services['templating.twig.fields'] = function ( $container ) {
            return Twig::setupEnvironment( $container, false );
        };
    }

    private function setupUtilities()
    {
        $this->Services['utility.logger'] = function ( $container ) {
            $path = KB_PLUGIN_PATH . '/logs';

            $ajax = defined( 'DOING_AJAX' ) && DOING_AJAX;
            $Logger = new Logger( 'kontentblocks' );
            if (Kontentblocks::DEBUG && is_user_logged_in() && apply_filters('kb.use.logger.console', false) ) {
                if (!$ajax) {
                    $Logger->pushHandler( new BrowserConsoleHandler() );
                    $Logger->addInfo(
                        'Hey there! Kontentblocks is running in dev mode but don\'t worry. Have a great day'
                    );
                }

                if (is_dir( $path ) && Kontentblocks::DEBUG_LOG) {
                    $Logger->pushHandler( new StreamHandler( $path . '/debug.log' ) );
                }
            } else {
                $Logger->pushHandler( new NullHandler() );
            }
            return $Logger;
        };

        $this->Services['utility.mobileDetect'] = function ( $container ) {
            return new MobileDetect();
        };

        $this->Services['utility.jsontransport'] = function ( $container ) {
            return new JSONTransport();
        };

        $this->Services['utility.ajaxhandler'] = function ( $container ) {
            return new AjaxCallbackHandler();
        };
        self::$AjaxHandler = $this->Services['utility.ajaxhandler'];
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
        $this->Services['registry.panels'] = function ( $Services ) {
            return new PanelRegistry( $Services );
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
add_action(
    'plugins_loaded',
    function () {
        Kontentblocks::getInstance();
    },
    5
);

register_activation_hook( __FILE__, array( '\Kontentblocks\Kontentblocks', 'onActivation' ) );
register_deactivation_hook( __FILE__, array( '\Kontentblocks\Kontentblocks', 'onDeactivation' ) );
register_uninstall_hook( __FILE__, array( '\Kontentblocks\Kontentblocks', 'onUninstall' ) );