<?php

namespace Kontentblocks;

use Kontentblocks\Backend\Dynamic\DynamicAreas;
use Kontentblocks\Backend\Dynamic\ModuleTemplates;
use Kontentblocks\Backend\Screen\EditScreen,
    Kontentblocks\Hooks\Enqueues,
    Kontentblocks\Hooks\Capabilities,
    Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Fields\FieldRegistry;

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
    const TABLEVERSION = '1.0.12';
    const CONTENTCONCAT = TRUE;


    public $dev_mode = true;
    static $instance;

    public $Capabilities;
    public $ModuleRegistry;

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    public function init()
    {
        define('KB_PLUGIN_URL', plugin_dir_url(__FILE__));
        define('KB_PLUGIN_PATH', plugin_dir_path(__FILE__));
        define('KB_TEMPLATE_URL', plugin_dir_url(__FILE__) . '/core/Modules/core-modules/');
        define('KB_TEMPLATE_PATH', plugin_dir_path(__FILE__) . 'core/Modules/core-modules/');
        define('KB_REFIELD_JS', plugin_dir_url(__FILE__) . '/Definitions/js/');

        // still there for historical reasons
        define('KONTENTLOCK', false);

        // Files used used on front and backend
        include_once dirname(__FILE__) . '/Autoloader.php';
        require_once dirname(__FILE__) . '/vendor/autoload.php';
        require_once dirname(__FILE__) . '/kontentblocks.public-api.php';


        include_once dirname(__FILE__) . '/core/Utils/helper.php';
        include_once dirname(__FILE__) . '/core/Utils/helper.new.php';

        /* Include all necessary files on admin area */
        if (is_admin()) {

            include_once dirname(__FILE__) . '/core/Utils/tables.php';
            include_once dirname(__FILE__) . '/core/Hooks/setup.php';
            require_once dirname(__FILE__) . '/includes/ajax-callback-handler.php';

            // @TODO stinks
            new EditScreen();
            new Capabilities();
        }

        // Temporary
        DynamicAreas::getInstance();
        ModuleTemplates::getInstance();
        Enqueues::getInstance();

        // enabled for 'page' by default
        add_post_type_support('page', 'kontentblocks');

        // load Templates automatically
        add_action('areas_setup', array($this, 'loadModules'), 9);

        // Load Plugins
        add_action('init', array($this, 'loadExtensions'), 9);

        // Load Fields
        add_action('init', array($this, 'loadFields'), 9);


        add_action('wp_head', array($this, 'livereload'));
        add_action('admin_head', array($this, 'livereload'));

        add_action('plugins_loaded', array($this, 'i18n'));

    }

    public function livereload()
    {
        echo '<script src="http://localhost:35729/livereload.js"></script>';
    }


    public function i18n()
    {
        load_plugin_textdomain('Kontentblocks', false, dirname(plugin_basename(__FILE__)) . '/languages/');
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

        $Registry = ModuleRegistry::getInstance();

        // add core modules path
        $paths = array(KB_TEMPLATE_PATH);

        // deprecated
        $paths = apply_filters('kb_add_template_path', $paths);
        // replacement for '_add_template_path'
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

    }

    /**
     * Load Extensions
     * @since 1.0.0
     */
    public function loadExtensions()
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
     *  Load Field Definitions
     */
    public function loadFields()
    {
            foreach (glob(KB_PLUGIN_PATH . 'core/Fields/Definitions/*.php') as $file) {
                FieldRegistry::getInstance()->add($file);
        }
    }

}

// end Kontentblocks

// Fire it up
Kontentblocks::getInstance()->init();