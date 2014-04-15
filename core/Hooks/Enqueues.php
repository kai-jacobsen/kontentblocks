<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\MobileDetect;

class Enqueues
{

    public static $instance;
    protected $styles;
    protected $adminScripts = array();
    protected $userScripts = array();


    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }


    public function __construct()
    {

        $this->Caps = Kontentblocks::getInstance()->Capabilities;

        add_action('init', array($this, 'registerScripts'));

        // enqueue styles and scripts where needed
        add_action('admin_print_styles-post.php', array($this, 'adminEnqueue'), 30);
        add_action('admin_print_styles-post-new.php', array($this, 'adminEnqueue'), 30);

        // Frontend Enqueueing
        add_action('wp_enqueue_scripts', array($this, 'userEnqueue'), 9);

    }


    public function registerScripts()
    {
        $folder = (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) ? 'dev' : 'dist';
        $suffix = (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) ? '' : '.min';
        $dependecies = array(
            'jquery', 'jquery-ui-core', 'jquery-ui-tabs', 'jquery-ui-sortable', 'jquery-ui-mouse', 'jquery-ui-draggable', 'backbone', 'underscore', 'wp-color-picker'
        );
        // Plugins
        wp_register_script('kb-plugins', KB_PLUGIN_URL . '/js/'. $folder .'/plugins'.$suffix.'.js', $dependecies, null, true);

        // Common & Util. Functions
        wp_register_script('kb-common', KB_PLUGIN_URL . 'js/'. $folder .'/common'.$suffix.'.js', array('kb-plugins'), null, true);

        // Extensions
        wp_register_script('kb-extensions', KB_PLUGIN_URL . '/js/'. $folder .'/extensions'.$suffix.'.js', array('kb-common'), null, true);

        if (is_admin()){
            // Backend 'controller'
            wp_register_script('kb-backend', KB_PLUGIN_URL . '/js/'. $folder .'/backend'.$suffix.'.js', array('kb-extensions'), null, true);
        } else{
            // frontend controller
            wp_register_script('kb-frontend', KB_PLUGIN_URL . 'js/'. $folder .'/frontend'.$suffix.'.js', array('kb-extensions'), null, true);
        }


        // Onsite
        wp_register_script('kb-onsite-editing', KB_PLUGIN_URL . 'js/KBOnSiteEditing.js', array('kb-frontend'), null, true);


        // FieldsAPI
        wp_register_script('kb-fields-api', KB_PLUGIN_URL . 'js/'. $folder .'/fieldsAPI'.$suffix.'.js', null, null, true);

        // fields handler
        wp_register_script('kb-refields', KB_PLUGIN_URL . '/js/'. $folder .'/refields'.$suffix.'.js',array('kb-fields-api'), null, true);

        // WP iris // no dev version available in core
        wp_register_script('wp-iris', admin_url('js/iris.min.js'), array('jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch'), false, true);

        // WP color picker
        wp_register_script('wp-color-picker', admin_url('js/color-picker'.$suffix.'.js'), array('wp-iris'), false, true);

        $this->customScripts();
    }


    /**
     * Enqueue all styles and scripts
     * Array for localization strings used by JS actions
     */
    function adminEnqueue()
    {
        global $is_IE;

        $this->appConfig();

        // enqueue scripts
        if (is_admin()) {

            // Main Stylesheet
            wp_enqueue_style('kontentblocks-base', KB_PLUGIN_URL . 'css/kontentblocks.css');
            $this->enqueueStyles();

            wp_enqueue_script('kb-backend');
            wp_enqueue_script('kb-refields');
            wp_enqueue_script('heartbeat');

            // add Kontentblocks l18n strings
            $localize = $this->_localize();
            wp_localize_script('kb-common', 'kontentblocks', $localize);
        }

        wp_enqueue_style( 'wp-color-picker' );
        wp_enqueue_script( 'wp-color-picker' );

        if ($is_IE) {
            wp_enqueue_script('respond', KB_PLUGIN_URL . 'js/respond.min.js', null, true, true);
            wp_enqueue_style('ie8css', KB_PLUGIN_URL . 'css/ie8css.css');
        }

        $this->enqueueAdminScripts();
        do_action('kb_enqueue_files');

    }

    // Front End editing
    public function userEnqueue()
    {

        $this->appConfig();
        if (is_user_logged_in() && !is_admin()) {

            wp_enqueue_script('kb-frontend');
            wp_enqueue_script('kb-onsite-editing');
            wp_enqueue_script('kb-refields');
            wp_enqueue_style('wp-color-picker');
            wp_enqueue_script('heartbeat');

            wp_enqueue_style('kb-base-styles', KB_PLUGIN_URL . '/css/kontentblocks.css');
            wp_enqueue_style('kb-onsite-styles', KB_PLUGIN_URL . '/css/KBOsEditStyle.css');
            $this->enqueueStyles();
            wp_localize_script('kb-common', 'kontentblocks', $this->_localize());

            wp_enqueue_script('wp-iris');
            wp_enqueue_script('wp-color-picker');
            $colorpicker_l10n = array(
                'clear' => __('Clear'),
                'defaultString' => __('Default'),
                'pick' => __('Select Color')
            );
            wp_localize_script('wp-color-picker', 'wpColorPickerL10n', $colorpicker_l10n);

            \Kontentblocks\Helper\getHiddenEditor();

            wp_enqueue_media();
        }
        $this->enqueueUserScripts();


    }

    public function appConfig()
    {
        global $post;



        $screen = (function_exists('get_current_screen')) ? get_current_screen() : null;

        $data = array(
            'frontend' => !is_admin(),
            'preview' => is_preview(),
            'loggedIn' => is_user_logged_in(),
            'user' => wp_get_current_user(),
            'ajax_url' => (is_user_logged_in()) ? admin_url('admin-ajax.php') : null,
            'url' => (is_user_logged_in()) ? KB_PLUGIN_URL : null,
            'post' => ($post && is_user_logged_in()) ? $post : null,
            'screen' => $screen,
            'dev' => Kontentblocks::DEVMODE,
            'version' => Kontentblocks::VERSION,
            'isMobile' => MobileDetect::getInstance()->isMobile()
        );

        if (is_preview()){
            $data['loggedIn'] = false;
        }

        JSONBridge::getInstance()->registerPublicData('config', null, $data);
    }

    private function _localize()
    {
        //Caps for the current user as global js object

        $current_user = wp_get_current_user();
        $roles = $current_user->roles;

        // get caps from options
        $option = get_option('kontentblocks_capabilities');

        // if, for some reason, caps not set, fallback to defaults
        $setup_caps = (!empty($option)) ? $option : $this->Caps->getCaps();

        // prepare cap collection for current user
        $caps = array();
        if (is_array($roles)) {
            foreach ($roles as $role) {
                if (!empty($setup_caps[$role])) {
                    foreach ($setup_caps[$role] as $cap) {
                        $caps[] = $cap;
                    }
                }
            }
        }

        // Setup the global js object base
        return array
        (
            'caps' => $caps,
            'config' => array(
                'url' => KB_PLUGIN_URL,
                'dev' => Kontentblocks::DEVMODE
            ),
            'nonces' => array(
                'update' => wp_create_nonce('kb-update'),
                'create' => wp_create_nonce('kb-create'),
                'delete' => wp_create_nonce('kb-delete'),
                'read' => wp_create_nonce('kb-read'),
            )
        );

    }


    public function enqueueStyles()
    {
        if (!empty($this->styles)) {
            foreach ($this->styles as $style) {
                wp_enqueue_style($style['handle'], $style['src']);
            }
        }

    }

    public function addScript($args, $where = 'both')
    {
        $defaults = array(
            'handle' => null,
            'src' => null,
            'deps' => array(),
            'version' => Kontentblocks::VERSION,
            'footer' => true
        );

        $def = wp_parse_args($args, $defaults);

        if (is_null($def['handle']) || is_null($def['src'])) {
            return false;
        }
        switch ($where) {

            case 'both':
                $this->adminScripts[$args['handle']] = $def;
                $this->userScripts[$args['handle']] = $def;
                break;
            case 'user':
                $this->userScripts[$args['handle']] = $def;
                break;
            case 'admin':
                $this->adminScripts[$args['handle']] = $def;
                break;
        }
    }

    private function customScripts()
    {
        $all = array_merge($this->adminScripts, $this->userScripts);
        foreach ($all as  $args) {

            wp_register_script($args['handle'], $args['src'], $args['deps'], $args['version'], $args['footer']);
        }
    }

    private function enqueueAdminScripts()
    {
        foreach ($this->adminScripts as $script) {
            wp_enqueue_script($script['handle']);
        }
    }

    private function enqueueUserScripts()
    {
        foreach ($this->userScripts as $script) {
            wp_enqueue_script($script['handle']);
        }
    }
}
