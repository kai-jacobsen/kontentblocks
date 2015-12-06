<?php

namespace Kontentblocks\Utils\CommonTwig;

use Twig_Environment;
use Twig_Extension_Debug;
use Twig_Loader_Filesystem;
use Twig_SimpleFunction;

/**
 * Class Twig
 * @package Kontentblocks\Templating
 */
class SimpleTwig
{

    public static $Environment;
    /**
     * @var Twig_Loader_Filesystem
     */
    public static $Loader;
    protected static $paths = array();

    public static function init()
    {
        self::setupLoader();
        self::setupEnvironment();
        return self::$Environment;
    }

    /**
     *
     */
    public static function setupLoader()
    {
        $paths = array();
        $paths[] = trailingslashit(get_stylesheet_directory());
        $paths = apply_filters( 'kb.theme.twig.paths', $paths );
        $Loader = new Twig_Loader_Filesystem( $paths );
        self::$Loader = $Loader;
    }

    /**
     *
     * @return Twig_Environment
     */
    public static function setupEnvironment()
    {
        $args = array(
            'cache' => WP_CONTENT_DIR . '/twigcache/',
            'auto_reload' => TRUE,
            'debug' => TRUE
        );


        $Environment = new Twig_Environment(
            self::$Loader,
            $args
        );

        $Environment->addExtension( new Twig_Extension_Debug() );
        $Environment->enableDebug();

        $Environment->registerUndefinedFunctionCallback( array( __CLASS__, 'undefinedFunctions' ) );
        $Environment->registerUndefinedFilterCallback( array( __CLASS__, 'undefinedFilters' ) );

        self::$Environment = $Environment;

        return $Environment;
    }

    /**
     * @author Rarst | https://github.com/Rarst/meadow/
     * @param $func
     * @return bool|Twig_SimpleFunction
     */
    public static function undefinedFunctions( $func )
    {
        if (function_exists( $func )) {
            return new Twig_SimpleFunction(
                $func,
                function () use ( $func ) {
                    ob_start();
                    $return = call_user_func_array( $func, func_get_args() );
                    $echo = ob_get_clean();
                    return empty( $echo ) ? $return : $echo;
                },
                array( 'is_safe' => array( 'all' ) )
            );
        }

        return false;
    }

    /**
     * @author Rarst | https://github.com/Rarst/meadow/
     * @param $filter
     * @return \Twig_SimpleFilter
     */
    public static function undefinedFilters( $filter )
    {
        return new \Twig_SimpleFilter(
            $filter,
            function () use ( $filter ) {

                return apply_filters( $filter, func_get_arg( 0 ) );
            },
            array( 'is_safe' => array( 'all' ) )
        );
    }

    /**
     * Will prepend the path to the Loaders paths
     * @param $path
     */
    public static function setPath( $path )
    {
        self::$Loader->prependPath( $path );
    }
}