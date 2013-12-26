<?php

namespace Kontentblocks;

use Kontentblocks\Backend\Post\EditScreen,
    Kontentfields\KFHandler,
    Kontentblocks\Frontend\AreaRender,
    Kontentblocks\Hooks\Enqueues,
    Kontentblocks\Hooks\Capabilities,
    Kontentblocks\Backend\Areas\AreaRegistry,
    Kontentblocks\Modules\ModuleRegistry;

/*
  Plugin Name:Kontentblocks.
  Plugin URI: http://kontentblocks.de
  Description: Content Management on steroids
  Version: 0.7
  Author: Kai Jacobsen
  Author URI: http://kontentblocks.de
  Text Domain: Kontentblocks
  Domain Path: /language
  License: Split License / GPL3
 */

Class Kontentblocks
{

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
        if (isset($_GET['resetkb'])) {
            delete_option('kb_dynamic_areas');
        }
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
//        require_once dirname( __FILE__ ) . '/includes/options/overlays/kontentblocks.overlay.onsite.edit.php';
        require_once dirname(__FILE__) . '/includes/ajax-callback-handler.php';

        // additional cap feature, only used on demand and not properly tested yet
        define('KONTENTLOCK', false);

        include_once dirname(__FILE__) . '/core/Utils/helper.php';
        include_once dirname(__FILE__) . '/core/Utils/tables.php';
        include_once dirname(__FILE__) . '/core/Utils/helper.new.php';
        /* Include all necessary files on admin area */
        if (is_admin()) {
            require_once 'includes/ajax/kontentblocks.ajax.generate.module.php';

            include_once dirname(__FILE__) . '/kontentblocks.options.php';
            include_once dirname(__FILE__) . '/core/Hooks/setup.php';
            include_once dirname(__FILE__) . '/includes/kontentblocks.sidebar-area-selector.php';


            $this->UI = new EditScreen();
            $this->Capabilities = new Capabilities();
        }

        $this->Enqueues = new Enqueues();
        // setup vars
        add_action('init', array($this, '_set_block_templates'), 850);

        add_post_type_support('page', 'kontentblocks');

        // load Templates automatically
        add_action('init', array($this, '_load_templates'), 9);

        // Load Plugins
        add_action('init', array($this, '_load_plugins'), 9);

        add_action('admin_head', array($this, 'livereload'));

        add_action('plugins_loaded', array($this, 'i18n'));

    }

    public function livereload()
    {
        echo '<script src="http://localhost:35729/livereload.js"></script>';

    }

    public function i18n()
    {
        load_plugin_textdomain('Kontentblocks', false, dirname(plugin_basename(__FILE__)) . '/language/');
        \Kontentblocks\Language\I18n::getInstance();

    }

    /**
     * Indicate whether we are on a post edit screen or inside the dynamic areas section
     *
     * @param bool $bool . defaults to true
     * @return void
     */
    public function set_post_context($bool)
    {
        $this->post_context = $bool;

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
        $paths = array(KB_TEMPLATE_PATH);
        $paths = apply_filters('kb_add_template_path', $paths);
        $paths = apply_filters('kb_add_module_path', $paths);
        foreach ($paths as $path) {
            $dirs = glob($path . '_*', GLOB_ONLYDIR);

            if (!empty($dirs)) {
                foreach ($dirs as $subdir) {
                    $files = glob($subdir . '/*.php');

                    foreach ($files as $template) {

                        if (strpos(basename($template), '__') === false)
                            include_once($template);
                    }
                }
            }
            $files = glob($path . '*.php');
            foreach ($files as $template) {
                if (strpos(basename($template), '__') === false)
                    include_once($template);
            }
        }

        do_action('kb_load_templates');

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

    /*
     * Instantiate a Block Class and store it
     * Each Block registers itself by using kb_register_blocks which calls this method
     *
     * @param string classname
     */

    public function register_block($classname)
    {

        $this->ModuleRegistry = ModuleRegistry::getInstance();

        if (!class_exists($classname)) {
            return false;
        }
        $this->ModuleRegistry->add($classname);

    }

    /*
     * Defaul wrapper template
     */

    public function register_wrapper($area_template)
    {
        $this->use_wrapper = true;
        $this->default_wrapper = $area_template;

    }

    /*
     * Setup Blocks takes arrays of block data and returns objects
     */

    public function _setup_blocks($blocks)
    {
        if (empty($blocks))
            return false;


        foreach (( array )$blocks as $block) {

            $args = wp_parse_args($block, Modules\Module::getDefaults());

            $block = apply_filters('kb_modify_block', $block);
            $block = apply_filters("kb_modify_block_{$block['id']}", $block);

            if (!class_exists($args['class']) or empty($this->blocks[$args['class']]))
                continue;

            // new instance
            $instance = new $args['class']($args['id'], $args['name'], $args);

            $instance->set_status($args['status']);
            $instance->set_draft($args['draft']);
            $instance->set_area($args['area']);

            foreach ($args as $k => $v)
                $instance->$k = $v;
            $collection[] = $instance;
        }
        return $collection;

    }

    /**
     * Prepare new area
     * two ways to go:
     *
     * if KB is in dev_mode, data gets handled by code and any saved data gets ignored
     * if KB is not in dev mode, initial setup happens just once, further editing of areas happens by the plugin menu page
     *
     * @param array $args
     * @return array
     */
    public function register_area($args, $manual = true)
    {
        $AreaRegistry = AreaRegistry::getInstance();
        $AreaRegistry->addArea($args, $manual);

    }

    /**
     * New Experimental Frontend Output factory
     */
    public function render_area($post_id, $area = null, $context = null, $subcontext = null, $args = null, $echo = true)
    {

        if (!isset($area)) {
            return false;
        }

        $args = AreaRegistry::getInstance()->getArea($area);
        if (!$args) {
            return false;
        }
        $Renderer = new AreaRender($post_id, $args, $context, $subcontext);
        $output = $Renderer->render($echo);
        return $output;

    }

    /**
     * get base id for new blocks
     * extracts the attached number of every block and returns the highest number found
     *
     * @param int
     */
    static function _get_highest_id($blocks)
    {
        $collect = '';
        if (!empty($blocks)) {
            foreach ($blocks as $block) {
                $block = maybe_unserialize($block);
                $count = strrchr($block['instance_id'], "_");
                $id = str_replace('_', '', $count);
                $collect[] = $id;
            }
        }

        return max($collect);

    }

    /**
     * Setup Blocks filters blocks for current area and returns array of objects
     * @param array $blocks
     * @param string $area
     * @return array
     */
    private function setup_blocks($blocks, $area)
    {
        $areablocks = array();


        $blocks = $this->_modify_blocks($blocks);


        $blocks = $this->_setup_blocks($blocks);


        foreach (( array )$blocks as $instance) {

            if ($instance->area == $area) {
                if (
                    $instance->active == false OR $instance->draft == 'true' OR $instance->settings['disabled'] == true
                ) {

                    continue;
                } else {
                    $areablocks[] = $instance;
                }
            } else {
                continue;
            }
        }
        return $areablocks;

    }

    /**
     * Filter  areas from entire areas array
     * This will actually return all areas, dynamic or not
     * @param context - string
     * @return array
     */
    public function get_areas($context = false)
    {

        $areas = array();
        $sareas = get_option('kb_registered_areas');


        $collection = array_merge(( array )$sareas, $this->areas);

        foreach ($collection as $area) {
            if (false != $context) {
                if ($area['context'] === $context) {
                    $areas[$area['id']] = $area;
                }
            } else {

                $areas[$area['id']] = $area;
            }
        }
        return $areas;

    }

    /**
     * Get a single area
     */
    public function get_area($area)
    {
        $areas = $this->get_areas();

        if (isset($areas[$area]))
            return $areas[$area];
        else
            return false;

    }

    /**
     * Filter dynamic areas from entire areas array
     * @param context - string
     * @return array
     */
    public function get_dynamic_areas($context = false, $exclude = false)
    {
        $d_areas = array();
        $sareas = get_option('kb_registered_areas');


        $collection = array_merge(( array )$sareas, $this->areas);

        foreach ($collection as $area) {
            if ($area['dynamic'] && $area['dynamic'] == true) {
                if (false != $context) {
                    if (in_array($area['context'], ( array )$context)) {
                        $d_areas[$area['id']] = $area;
                    }
                } elseif (false != $exclude && $area['context'] === $exclude) {
                    continue;
                } else {
                    $d_areas[$area['id']] = $area;
                }
            }
        }
        return $d_areas;

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

//    /**
//     * Get Blocks
//     * @param string $post_id
//     * @param string $area
//     * @return array
//     */
//    public static function get_blocks( $post_id, $area, $post_context )
//    {
//        if ( true === $post_context ) {
//            return get_post_meta( $post_id, 'kb_kontentblocks', true );
//        }
//        else {
//            $dynamic_areas = get_option( 'kb_dynamic_areas' );
//
//            if ( !empty( $dynamic_areas[ $area ] ) )
//                return $dynamic_areas[ $area ];
//        }
//
//    }
//
//    /**
//     * Get block data depending on context
//     * @param string $post_id
//     * @param array $block
//     * @return array
//     */
//    public static function get_data( $post_id, $block, $post_context )
//    {
//
//        if ( isset( $block->master ) && $block->master === true )
//            return get_option( $block->instance_id );
//
//        if ( true === $post_context ) {
//            if ( isset( $_GET[ 'preview' ] ) ) {
//                $preview_data = get_post_meta( $post_id, '_preview_' . $block->instance_id, true );
//                if ( !empty( $preview_data ) ) {
//                    return $preview_data;
//                }
//                else {
//                    return get_post_meta( $post_id, '_' . $block->instance_id, true );
//                }
//            }
//            else {
//                return get_post_meta( $post_id, '_' . $block->instance_id, true );
//            }
//        }
//        else {
//            return get_option( $block->instance_id );
//        }
//
//    }
//
//    public function get_area_template( $collection, $this_area_settings, $area_options )
//    {
//        $area_template = null;
//
//        if ( !empty( $collection ) ) {
//            $blockcount = count( $collection );
//
//
//            $assigned_area_templates = (!empty( $area_options[ 'area_templates' ] )) ? $area_options[ 'area_templates' ] : null;
//            $forced_tpl              = (null != $assigned_area_templates) ? $this->get_forced_templates( $assigned_area_templates ) : null;
//
//            if ( !empty( $forced_tpl ) ) {
//                foreach ( $forced_tpl as $ftpl ) {
//                    if ( in_array( $blockcount, $ftpl[ 'force_by' ] ) ) {
//                        $area_template = $ftpl;
//
//                        break;
//                    }
//                }
//            }
//
//            if ( $this->use_wrapper ) {
//                if ( !empty( $this->default_wrapper ) && is_array( $this->default_wrapper ) ) {
//                    $area_template = $this->default_wrapper;
//                }
//            }
//
//
//
//            if ( empty( $forced_tpl ) or null == $area_template ) {
//
//                $atpl = (!empty( $this_area_settings[ 'area_template' ] ) ) ? $this_area_settings[ 'area_template' ] : null;
//                if ( null !== $atpl ) {
//                    $area_template = $this->area_templates[ $atpl ];
//                }
//            }
//        }
//        return $area_template;
//
//    }
//    public function get_forced_templates( $assigned_area_templates )
//    {
//        $forced_areas = null;
//        $settings     = array();
//
//        if ( !empty( $assigned_area_templates ) ) {
//
//            foreach ( $assigned_area_templates as $atpl ) {
//                $atpl = (!empty( $this->area_templates[ $atpl ] )) ? $this->area_templates[ $atpl ] : null;
//                if ( !empty( $atpl[ 'force_by' ] ) ) {
//                    $forced_areas[] = $atpl;
//                }
//            }
//        }
//
//        if ( !empty( $forced_areas ) ) {
//            foreach ( $forced_areas as $area ) {
//                $settings[ $area[ 'id' ] ] = $area;
//            }
//        }
//
//        return $settings;
//
//    }

    public function _set_block_templates()
    {
        $this->block_templates = get_option('kb_block_templates');

    }

    public function get_block_templates()
    {
        return $this->block_templates;

    }

//    public function get_block_template( $id )
//    {
//        $tpls = $this->get_block_templates();
//
//        if ( isset( $tpls[ $id ] ) )
//            return $tpls[ $id ];
//        else
//            return false;
//
//    }

    /**
     * Retrieve templateable Templates from Block Collection
     * @return array
     */
    public function get_templateables()
    {
        $blocks = null;

        if (!empty($this->blocks)) {
            foreach ($this->blocks as $block) {
                if (isset($block->settings['templateable']) and $block->settings['templateable'] == true) {
                    $blocks[] = $block;
                }
            }
        }
        return $blocks;

    }

    function add_reveal()
    {
        echo "<div id='onsite-modal' class='reveal large reveal-modal'>
            <iframe seamless id='osframe' src='' width='100%' height='400'>
            </iframe>
            </div>";

    }

//    /*
//     * Adds a class to each block of each area for better targeting / styling purposes
//     */
//
//    public function get_element_class( $i, $count )
//    {
//        $class = __return_empty_array();
//
//        if ( 1 == $i )
//            $class[] = " first-module";
//
//        if ( $count == $i )
//            $class[] = " last-module";
//
//        $class[] = " element-{$i}";
//
//        return implode( ' ', $class );
//
//    }

    public function _modify_blocks($blocks)
    {

        foreach ($blocks as $block => $item) {

            if (isset($item['master']) && $item['master'] === true) {
                $tpls = $this->get_block_templates();


                $ref = (isset($item['master_ref'])) ? $item['master_ref'] : null;


                if (empty($ref))
                    $ref = get_option($block);

                $args = $tpls[$ref];


                $item['class'] = $args['class'];
                $item['instance_id'] = $args['instance_id'];
                $item['dynamic'] = true;

                $blocks[$block] = $item;
            }
        }

        return $blocks;

    }

    public function _virtual_template($saved_area_settings)
    {
        $columns = explode(',', $saved_area_settings);

        foreach ($columns as $col) {
            $layout[] = array(
                'classes' => $this->_translate_col($col),
                'columns' => $col
            );
        };

        $template = array(
            'id' => 'fictional',
            'name' => 'Bond, James Bond',
            'layout' => $layout,
            'last-item' => false
        );

        return $template;

    }

}

// end Kontentblocks


global $Kontentblocks;
$Kontentblocks = Kontentblocks::getInstance();
$Kontentblocks->init();

global $Kontentfields, $K;
add_action('init', 'Kontentblocks\init_Kontentfields', 15);

function init_Kontentfields()
{
    foreach (glob(KB_PLUGIN_PATH . 'core/Fields/Definitions/*.php') as $file) {
        require_once $file;
    }
    if (!is_admin()) {
        return false;
    }
    global $Kontentfields;
    $Kontentfields = new KFHandler;
    $Kontentfields->init();
    // load field files...
    foreach (glob(KB_FIELD_PATH . '*.php') as $file) {
        require_once $file;
    }

}
