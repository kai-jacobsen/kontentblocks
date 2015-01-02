<?php
namespace Kontentblocks\Templating;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\ImageResize;
use Pimple\Container;
use Twig_SimpleFunction;

/**
 * Class Twig
 * @package Kontentblocks\Templating
 */
class Twig
{

    protected static $paths = array();


    /**
     * @return \Twig_Loader_Filesystem
     */
    public static function setupLoader()
    {
        $paths = array();
        if (is_file( get_template_directory() . '/module-templates/' )) {
            $paths[] = apply_filters( 'kb_twig_def_path', get_template_directory() . '/module-templates/' );
        }
        if (is_child_theme() && is_file( get_stylesheet_directory() . '/module-templates/' )) {
            $paths[] = apply_filters( 'kb_twig_def_path', get_stylesheet_directory() . '/module-templates/' );
        }
        $Loader = new \Twig_Loader_Filesystem( $paths );
        return $Loader;

    }

    /**
     *
     * @param Container $Services
     * @param bool $public
     * @return \Twig_Environment
     */
    public static function setupEnvironment( Container $Services, $public = true )
    {

        $args = array(
            'cache' => apply_filters( 'kb:twig.cachepath', WP_CONTENT_DIR . '/twigcache/' ),
            'auto_reload' => TRUE,
            'debug' => TRUE
        );

        if (!$public) {
            $args['cache'] = trailingslashit(KB_PLUGIN_PATH) . 'cache/';
            $args['autoescape'] = false;
        }

        $Environment = new \Twig_Environment(
            $Services['templating.twig.loader'],
            $args
        );

        $Environment->addExtension( new \Twig_Extension_Debug() );
        $Environment->enableDebug();

        $Environment->registerUndefinedFunctionCallback( array( __CLASS__, 'undefinedFunctions' ) );
        $Environment->registerUndefinedFilterCallback( array( __CLASS__, 'undefinedFilters' ) );

        self::addCustomFunctions( $Environment );

        return $Environment;
    }

    /**
     * @author Rarst | https://github.com/Rarst/meadow/
     * @param $func
     * @return bool|\Twig_SimpleFunction
     */
    public static function undefinedFunctions( $func )
    {
        if (function_exists( $func )) {
            return new \Twig_SimpleFunction(
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
     * @param \Twig_Environment $Environment
     */
    private static function addCustomFunctions( \Twig_Environment $Environment )
    {
        $getImage = new Twig_SimpleFunction(
            'getImage',
            function ( $id, $width = null, $height = null, $crop = true, $single = true, $upscale = true ) {
                return ImageResize::getInstance()->process( $id, $width, $height, $crop, $single, $upscale );
            }
        );
        $Environment->addFunction( $getImage );
    }

    /**
     * Will prepend the path to the Loaders paths
     * @param $path
     */
    public static function setPath( $path )
    {
        Kontentblocks::getService( 'templating.twig.loader' )->prependPath( $path );
    }
}