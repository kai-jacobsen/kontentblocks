<?php

namespace Kontentblocks\Language;

class I18n
{

    static $packages;
    static $instance;

    public static function getInstance()
    {
        if ( null === self::$instance ) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    private function __construct()
    {
        add_action( 'wp_footer', array( $this, 'toJSON' ) );
        add_action( 'admin_footer', array( $this, 'toJSON' ) );
        self::loadPackages();

    }

    private static function loadPackages()
    {
        $path  = dirname( __FILE__ );
        $files = glob( $path . '/packages/*.php' );

        foreach ( $files as $file ) {
            include_once $file;
        }

    }

    public static function addPackage( $context, $strings )
    {
        if ( !isset( self::$packages[ $context ] ) ) {
            self::$packages[ $context ] = $strings;
        }

    }

    public static function getPackage( $context )
    {
        $path   = explode( '.', $context );
        $result = NULL;

        foreach ( $path as $pk ) {
            $result = self::_getSubpackage( $result, $pk );
        }
        return $result;

    }

    public static function getPackages()
    {
        $return = array();
        if ( func_num_args() > 0 ) {
            foreach ( func_get_args() as $arg ) {
                $return += self::getPackage( $arg );
            }
        }
        return $return;

    }

    private static function _getSubpackage( $result, $context )
    {
        if ( is_null( $result ) ) {
            $result = self::$packages;
        }

        if ( isset( $result[ $context ] ) ) {
            return $result[ $context ];
        }
        return array();

    }

    public static function toJSON()
    {
        if ( is_user_logged_in() ) {
            $json = json_encode( self::$packages );
            echo "<script>var KB = KB || {}; KB.i18n = {$json};</script>";
        }

    }

}
