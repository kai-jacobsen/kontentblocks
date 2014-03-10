<?php

namespace Kontentblocks;

use Kontentblocks\Backend\Dynamic\DynamicAreas;
use Kontentblocks\Backend\Dynamic\ModuleTemplates;
use Kontentblocks\Backend\Screen\EditScreen,
    Kontentblocks\Hooks\Enqueues,
    Kontentblocks\Hooks\Capabilities,
    Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Modules\ModuleRegistry;

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

Class Kontentblocks
{

    const VERSION = '1.0.0alpha';
    const DEVMODE = true;

    public $dev_mode = true;
    static $instance;

    /**
     * Stores created areas
     * @var array
     */
    public $areas = array();

    /**
     * Stores a instance for each Block
     *
     * @var array objects
     */
    public $blocks = array();

    /**
     * Stores area settings
     *
     * @var array
     */
    public $area_settings = array();

    /**
     * Store Area Templates
     *
     * @var array
     */
    public $area_templates = array();

    /*
     * Flag for wrapper usage
     */
    public $use_wrapper = false;

    /*
     * Default Wrapper Template
     */
    public $default_wrapper = null;

    /*
     * Array of Roles and Caps used by and for Kontentblocks
     *
     * @var array
     */
    public $caps = array();

    /**
     * Set  Post Context
     * indicates where the data is stored. either post_meta (true) or option(false)
     * defaults to true, and is set to false if called on option pages
     */
    public $post_context = true;

    /**
     * Available Block Templates
     */
    public $block_templates = array();

    /*
     * Constructor
     * Setup constants and include necessary files
     *
     */
    public $Capabilities;
    protected $Enqueues;
    public $ModuleRegistry;

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    function __construct()
    {

    }

    public function init()
    {

        /* Define some path constants to make things a bit easier */
        define('KB_PLUGIN_URL', plugin_dir_url(__FILE__));
        define('KB_PLUGIN_PATH', plugin_dir_path(__FILE__));
        define('KB_TEMPLATE_URL', plugin_dir_url(__FILE__) . '/core/Modules/core-modules/');
        define('KB_TEMPLATE_PATH', plugin_dir_path(__FILE__) . 'core/Modules/core-modules/');
        define('KB_REFIELD_JS', plugin_dir_url(__FILE__) . '/Definitions/js/');

        // Files used used on front and backend
        include_once dirname(__FILE__) . '/Autoloader.php';
        require_once dirname(__FILE__) . '/vendor/autoload.php';
        require_once dirname(__FILE__) . '/kontentblocks.public-api.php';
        require_once dirname(__FILE__) . '/includes/ajax-callback-handler.php';

        // additional cap feature, only used on demand and not properly tested yet
        define('KONTENTLOCK', false);

        include_once dirname(__FILE__) . '/core/Utils/helper.php';
        include_once dirname(__FILE__) . '/core/Utils/tables.php';
        include_once dirname(__FILE__) . '/core/Utils/helper.new.php';
        /* Include all necessary files on admin area */
        if (is_admin()) {

            include_once dirname(__FILE__) . '/core/Hooks/setup.php';

            // @TODO Quatsch
            $this->UI = new EditScreen();
            $this->Capabilities = new Capabilities();
        }

        // Temporary
        // @TODO Quatsch
        DynamicAreas::getInstance();
        ModuleTemplates::getInstance();

        // @TODO Quatsch
        $this->Enqueues = new Enqueues();
        add_post_type_support('page', 'kontentblocks');

        // load Templates automatically
        add_action('init', array($this, '_load_templates'), 9);

        // Load Plugins
        add_action('init', array($this, '_load_plugins'), 9);

        add_action('wp_head', array($this, 'livereload'));
        add_action('admin_head', array($this, 'livereload'));

        add_action('plugins_loaded', array($this, 'i18n'));

    }

    public function livereload()
    {
        echo '<script src="http://localhost:35729/livereload.js"></script>';
        echo '<script src="http://localhost:35730/livereload.js"></script>';

    }


    public function i18n()
    {
        load_plugin_textdomain('Kontentblocks', false, dirname(plugin_basename(__FILE__)) . '/languages/');
        \Kontentblocks\Language\I18n::getInstance();

    }


    /**
     * Load (Block)Template Files
     * Simply auto-includes all .php files inside the templates folder
     *
     * uses filter: kb_template_paths to register / modify path array from the outside
     *
     * TODO: Some Kind of verification and/or switch to meta data usage
     */
    public function _load_templates()
    {

        $Registry = ModuleRegistry::getInstance();

        $paths = array(KB_TEMPLATE_PATH);
        $paths = apply_filters('kb_add_template_path', $paths);
        $paths = apply_filters('kb_add_module_path', $paths);
        foreach ($paths as $path) {
            $dirs = glob($path . 'Module*', GLOB_ONLYDIR);
            if (!empty($dirs)) {
                foreach ($dirs as $subdir) {
                    $files = glob($subdir . '/Module*.php');
                    foreach ($files as $template) {

                        if (strpos(basename($template), '__') === false)

                        $Registry->add($template);
                    }
                }
            }
            $files = glob($path . '*.php');
            foreach ($files as $template) {
                if (strpos(basename($template), '__') === false)
                    $Registry->add($template);
            }
        }

        do_action('kb_load_templates');


        // todo remove from here
//        MenuManager::getInstance();
    }

    /**
     * Load Plugins to extend certain functionalities
     * @since 0.8
     */
    public function _load_plugins()
    {

        $paths = array(kb_get_plugin_path());
        $paths[] = plugin_dir_path(__FILE__) . '/helper/';
        $paths = apply_filters('kb_add_plugin_path', $paths);

        foreach ($paths as $path) {

            //take care of dirs
            foreach (glob($path . "*", GLOB_ONLYDIR) as $filename) {
                $base = basename($filename);
                if (file_exists(trailingslashit($filename) . $base . '.php')) {
                    include_once($filename . $base . '.php');

                }
            }

            // take care of files
            $files = glob($path . '*.php');
            foreach ($files as $template) {
                include_once($template);
            }
        }

        do_action('kontentblocks_init');

    }

    /**
     * Prepare new area
     * two ways to go:
     *
     * if KB is in dev_mode, data gets handled by code and any saved data gets ignored
     * if KB is not in dev mode, initial setup happens just once, further editing of areas happens by the plugin menu page
     *
     * @param array $args
     * @param bool $manual
     * @return array
     */
    public function register_area($args, $manual = true)
    {
        $AreaRegistry = AreaRegistry::getInstance();
        $AreaRegistry->addArea($args, $manual);

    }


    /*
     * ------------------------------------------------
     * Area Settings
     * ------------------------------------------------
     */

    /**
     * register area template
     */
    public function register_area_template($args)
    {

        $defaults = array
        (
            'id' => '',
            'label' => '',
            'layout' => array(),
            'last-item' => false,
            'thumbnail' => null,
            'cycle' => false
        );

        $settings = wp_parse_args($args, $defaults);

        if (!empty($settings['id'])) {
            AreaRegistry::getInstance()->addTemplate($settings);
        }

    }

}

// end Kontentblocks


global $Kontentblocks;
$Kontentblocks = Kontentblocks::getInstance();
$Kontentblocks->init();

add_action('init', 'Kontentblocks\init_Kontentfields', 15);

function init_Kontentfields()
{
    foreach (glob(KB_PLUGIN_PATH . 'core/Fields/Definitions/*.php') as $file) {
        require_once $file;
    }
    if (!is_admin()) {
        return false;
    }

}
