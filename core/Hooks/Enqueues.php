<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\MobileDetect;
use Kontentblocks\Utils\Utilities;

/**
 * Class Enqueues
 * @package Kontentblocks\Hooks
 */
class Enqueues
{

    protected static $styles;
    protected static $adminScripts = array();
    protected static $userScripts = array();


    public static function setup()
    {

        add_action( 'init', array( __CLASS__, 'registerScripts' ) );

        // enqueue styles and scripts where needed
        add_action( 'admin_print_styles-post.php', array( __CLASS__, 'adminEnqueue' ), 30 );
        add_action( 'admin_print_styles-post-new.php', array( __CLASS__, 'adminEnqueue' ), 30 );

        add_action( 'kb.do.enqueue.admin.files', array( __CLASS__, 'adminEnqueue' ) );

        // Frontend Enqueueing
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'coreStylesEnqueue' ), 9 );
        add_action( 'wp_footer', array( __CLASS__, 'UserEnqueue' ), 9 );

    }


    public static function registerScripts()
    {
        $folder = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? 'dev' : 'dist';
        $suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
        $dependecies = array(
            'jquery',
            'jquery-ui-core',
            'jquery-ui-tabs',
            'jquery-ui-sortable',
            'jquery-ui-mouse',
            'jquery-ui-draggable',
            'jquery-ui-droppable',
            'backbone',
            'underscore',
            'wp-color-picker',
            'editor',
            'quicktags',
        );
        // Plugins
        wp_register_script(
            'kb-plugins',
            KB_PLUGIN_URL . 'js/' . $folder . '/plugins' . $suffix . '.js',
            $dependecies,
            null,
            true
        );


        // Common & Util. Functions
        wp_register_script(
            'kb-common',
            KB_PLUGIN_URL . 'js/' . $folder . '/common' . $suffix . '.js',
            array( 'kb-plugins' ),
            null,
            true
        );

        // Extensions
        wp_register_script(
            'kb-extensions',
            KB_PLUGIN_URL . 'js/' . $folder . '/extensions' . $suffix . '.js',
            array( 'kb-common' ),
            null,
            true
        );

        // FieldsAPI
        wp_register_script(
            'kb-fields-api',
            KB_PLUGIN_URL . 'js/' . $folder . '/fieldsAPI' . $suffix . '.js',
            array('kb-extensions'),
            null,
            true
        );

        // fields handler
        wp_register_script(
            'kb-refields',
            KB_PLUGIN_URL . 'js/' . $folder . '/refields' . $suffix . '.js',
            array( 'kb-fields-api' ),
            null,
            true
        );

        if (is_admin()) {
            // Backend 'controller'
            wp_register_script(
                'kb-backend',
                KB_PLUGIN_URL . 'js/' . $folder . '/backend' . $suffix . '.js',
                array( 'kb-refields' ),
                null,
                true
            );
        } else {
            // frontend controller
            wp_register_script(
                'kb-frontend',
                KB_PLUGIN_URL . 'js/' . $folder . '/frontend' . $suffix . '.js',
                array( 'kb-refields', ),
                null,
                true
            );
        }


        // Onsite
        wp_register_script(
            'kb-onsite-editing',
            KB_PLUGIN_URL . 'js/KBOnSiteEditing.js',
            array( 'kb-frontend' ),
            null,
            true
        );






        // WP iris // no dev version available in core
        wp_register_script(
            'wp-iris',
            admin_url( 'js/iris.min.js' ),
            array( 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ),
            false,
            true
        );

        // WP color picker
        wp_register_script(
            'wp-color-picker',
            admin_url( 'js/color-picker' . $suffix . '.js' ),
            array( 'wp-iris' ),
            false,
            true
        );

        // wp.media Extensions
        wp_register_script(
            'kb-media-ext',
            KB_PLUGIN_URL . '/js/' . $folder . '/mediaExt' . $suffix . '.js',
            array(),
            false,
            true
        );
        self::customScripts();
    }


    /**
     * Enqueue all styles and scripts
     * Array for localization strings used by JS actions
     */
    public static function adminEnqueue()
    {
        global $is_IE;

        self::appConfig();

        // enqueue scripts
        if (is_admin()) {

            // Main Stylesheet
            wp_enqueue_style( 'kontentblocks-base', KB_PLUGIN_URL . 'css/kontentblocks.css' );
            self::enqueueStyles();

            wp_enqueue_script( 'kb-backend' );
            wp_enqueue_script( 'kb-refields' );
            wp_enqueue_script( 'heartbeat' );

            // add Kontentblocks l18n strings
//            $localize = self::localize();
//            wp_localize_script( 'kb-common', 'kontentblocks', $localize );

        }

        wp_enqueue_style( 'wp-color-picker' );
        wp_enqueue_script( 'wp-color-picker' );

        if ($is_IE) {
            wp_enqueue_script( 'respond', KB_PLUGIN_URL . 'js/respond.min.js', null, true, true );
            wp_enqueue_style( 'ie8css', KB_PLUGIN_URL . 'css/ie8css.css' );
        }

        self::enqueueAdminScripts();
        do_action( 'kb.enqueue.admin.files' );

    }

    public static function coreStylesEnqueue()
    {
        if (is_user_logged_in() && !is_admin()) {
            wp_enqueue_style( 'wp-color-picker' );
            wp_enqueue_style( 'kb-base-styles', KB_PLUGIN_URL . '/css/kontentblocks.css' );
            wp_enqueue_style( 'kb-onsite-styles', KB_PLUGIN_URL . '/css/KBOsEditStyle.css' );
            self::enqueueStyles();
        }
    }

    // Front End editing
    public static function userEnqueue()
    {

//        if (!isset($_GET['kbedit'])){
//            return;
//        }

        self::appConfig();
        if (is_user_logged_in() && !is_admin()) {

            wp_enqueue_script( 'kb-frontend' );
            wp_enqueue_script( 'kb-onsite-editing' );
            wp_enqueue_script( 'kb-refields' );
            wp_enqueue_script( 'heartbeat' );


//            wp_localize_script( 'kb-common', 'kontentblocks', self::localize() );

            wp_enqueue_script( 'wp-iris' );
            wp_enqueue_script( 'wp-color-picker' );
            $colorpicker_l10n = array(
                'clear' => __( 'Clear' ),
                'defaultString' => __( 'Default' ),
                'pick' => __( 'Select Color' )
            );
            wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n', $colorpicker_l10n );

            Utilities::hiddenEditor();
            wp_enqueue_script( 'kb-media-ext' );

        }
        self::enqueueUserScripts();


    }

    public static function appConfig()
    {
        global $post;
        $screen = ( function_exists( 'get_current_screen' ) ) ? get_current_screen() : null;
        $data = array(
            'frontend' => !is_admin(),
            'preview' => is_preview(),
            'loggedIn' => is_user_logged_in(),
            'user' => wp_get_current_user(),
            'ajax_url' => ( is_user_logged_in() ) ? admin_url( 'admin-ajax.php' ) : null,
            'url' => ( is_user_logged_in() ) ? KB_PLUGIN_URL : '',
            'post' => ( $post && is_user_logged_in() ) ? $post : array(),
            'screen' => $screen,
            'dev' => Kontentblocks::DEVMODE,
            'version' => Kontentblocks::VERSION,
            'isMobile' => Kontentblocks::getService( 'utility.mobileDetect' )->isMobile(),
            'useModuleNav' => apply_filters( 'kb:config.module-nav', true )
        );

        if (is_preview()) {
            $data['loggedIn'] = false;
        }

        $data = array_merge( $data, self::localize() );

        Kontentblocks::getService( 'utility.jsontransport' )->registerPublicData( 'config', null, $data );
    }

    /**
     *
     * @return array
     */
    private static function localize()
    {
        //Caps for the current user as global js object

        $current_user = wp_get_current_user();
        $roles = $current_user->roles;

        // get caps from options
        $option = get_site_option( 'kb.capabilities' );

        // if, for some reason, caps not set, fallback to defaults
        $setup_caps = ( !empty( $option ) ) ? $option : Capabilities::defaultCapabilities();

        // prepare cap collection for current user
        $caps = array();
        if (is_array( $roles )) {
            foreach ($roles as $role) {
                if (!empty( $setup_caps[$role] )) {
                    foreach ($setup_caps[$role] as $cap) {
                        $caps[] = $cap;
                    }
                }
            }
        }

        $hash = uniqid( 'kb', true );

        if (function_exists( 'getGitHash' )) {
            $hash = getGitHash();
        }
        // Setup the global js object base
        return array
        (
            'caps' => $caps,
            'env' => array(
                'rootUrl' => KB_PLUGIN_URL,
                'fieldJsUrl' => KB_REFIELD_JS,
                'dev' => Kontentblocks::DEVMODE,
                'hash' => $hash,
            ),
            'nonces' => array(
                'update' => wp_create_nonce( 'kb-update' ),
                'create' => wp_create_nonce( 'kb-create' ),
                'delete' => wp_create_nonce( 'kb-delete' ),
                'read' => wp_create_nonce( 'kb-read' ),
            )
        );
    }


    public static function enqueueStyles()
    {
        if (!empty( self::$styles )) {
            foreach (self::$styles as $style) {
                wp_enqueue_style( $style['handle'], $style['src'] );
            }
        }

    }

    public static function addScript( $args, $where = 'both' )
    {
        $defaults = array(
            'handle' => null,
            'src' => null,
            'deps' => array(),
            'version' => Kontentblocks::VERSION,
            'footer' => true
        );

        $def = wp_parse_args( $args, $defaults );

        if (is_null( $def['handle'] ) || is_null( $def['src'] )) {
            return false;
        }
        switch ($where) {

            case 'both':
                self::$adminScripts[$args['handle']] = $def;
                self::$userScripts[$args['handle']] = $def;
                break;
            case 'user':
                self::$userScripts[$args['handle']] = $def;
                break;
            case 'admin':
                self::$adminScripts[$args['handle']] = $def;
                break;
        }
    }

    private static function customScripts()
    {
        $all = array_merge( self::$adminScripts, self::$userScripts );
        foreach ($all as $args) {

            wp_register_script( $args['handle'], $args['src'], $args['deps'], $args['version'], $args['footer'] );
        }
    }

    private static function enqueueAdminScripts()
    {
        foreach (self::$adminScripts as $script) {
            wp_enqueue_script( $script['handle'] );
        }
    }

    private static function enqueueUserScripts()
    {
        foreach (self::$userScripts as $script) {
            wp_enqueue_script( $script['handle'] );
        }
    }
}
