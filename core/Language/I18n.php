<?php

namespace Kontentblocks\Language;

/**
 * Class I18n
 *
 * Provides an API to the language string management which are
 * separated into single files
 * Provides some basic methods to check for (WPML) languages
 *
 * @package Kontentblocks
 * @subpackage Language
 */
class I18n
{
    /**
     * A Package is a set of translateable strings
     * which are placed under a certain namespace
     * @var array
     */
    static $packages;

    /**
     * Singleton Instance
     * @var self Object
     */
    static $instance;

    /**
     * Constructor
     * Add action and load packages from subfolder
     */
    private function __construct()
    {
        if (is_user_logged_in() && current_user_can( 'edit_kontentblocks' )) {
            add_action( 'wp_footer', array( $this, 'toJSON' ) );
            add_action( 'admin_footer', array( $this, 'toJSON' ) );
        };
        self::loadPackages();

    }

    /**
     * Auto-include all .php files from subfolder /packages
     */
    private static function loadPackages()
    {
        $path = dirname( __FILE__ );
        $files = glob( $path . '/packages/*.php' );

        foreach ($files as $file) {
            include_once $file;
        }

    }

    public static function getInstance()
    {
        if (null === self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    /**
     * Each language package must register itself with this method
     * @param $context string I18n-namespace
     * @param $strings array of translatable string
     */
    public static function addPackage( $context, $strings )
    {
        if (!isset( self::$packages[$context] )) {
            self::$packages[$context] = $strings;
        }

    }

    public static function getPackages()
    {
        $return = array();
        if (func_num_args() > 0) {
            foreach (func_get_args() as $arg) {
                $return += self::getPackage( $arg );
            }
        }
        return $return;

    }

    public static function getPackage( $context )
    {
        $path = explode( '.', $context );
        $result = NULL;

        foreach ($path as $pk) {
            $result = self::_getSubpackage( $result, $pk );
        }
        return $result;

    }

    private static function _getSubpackage( $result, $context )
    {
        if (is_null( $result )) {
            $result = self::$packages;
        }

        if (isset( $result[$context] )) {
            return $result[$context];
        }
        return array();

    }

    public static function toJSON()
    {
        if (is_user_logged_in()) {
            $json = json_encode( self::$packages );
            echo "<script>var KB = KB || {}; KB.i18n = {$json};</script>";
        }

    }

    public static function getActiveLanguage()
    {
        global $sitepress;
        $wpmlActive = self::wpmlActive();
        if ($wpmlActive) {
            return $sitepress->get_current_language();
        } else {
            return self::get2CharLocale();
        }
    }


    public static function wpmlActive()
    {
        if (!function_exists( 'is_plugin_active' )) {
            include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
        }

        return is_plugin_active( 'sitepress-multilingual-cms/sitepress.php' );

    }

    public static function get2CharLocale()
    {
        $locale = explode( '_', get_locale() );
        return $locale[0];
    }

    public static function getActiveLanguages()
    {
        global $sitepress;

        if (is_object( $sitepress ) && self::wpmlActive()) {
            return $sitepress->get_active_languages();
        }

        return self::getDefaultLanguageCode();

    }

    public static function getDefaultLanguageCode()
    {
        global $sitepress;
        if (self::wpmlActive()) {
            return $sitepress->get_default_language();
        } else {
            return self::get2CharLocale();
        }
    }
}
