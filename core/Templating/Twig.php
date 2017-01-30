<?php
namespace Kontentblocks\Templating;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\ImageResize;
use Pimple\Container;
use Twig_Extension_StringLoader;
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
        if (is_dir(get_template_directory() . '/module-templates/')) {
            $paths[] = apply_filters('kb_twig_def_path', get_template_directory() . '/module-templates/');
        }
        if (is_child_theme() && is_dir(get_stylesheet_directory() . '/module-templates/')) {
            $paths[] = apply_filters('kb_twig_def_path', get_stylesheet_directory() . '/module-templates/');
        }

        $paths[] = KB_PLUGIN_PATH . 'core/Fields/Definitions/templates/';
        $paths[] = KB_PLUGIN_PATH . 'core/Fields/Customizer/templates/';

        $paths = apply_filters('kb.templating.paths', $paths);
        $loader = new \Twig_Loader_Filesystem($paths);
        return $loader;

    }

    /**
     *
     * @param Container $services
     * @param bool $public
     * @return \Twig_Environment
     */
    public static function setupEnvironment(Container $services, $public = true)
    {

        $args = array(
            'cache' => apply_filters('kb.twig.cachepath', WP_CONTENT_DIR . '/twigcache/'),
            'auto_reload' => true,
            'debug' => true
        );

        if (!$public) {
            $args['cache'] = trailingslashit(KB_PLUGIN_PATH) . 'cache/';
            $args['autoescape'] = false;
        }

        $environment = new \Twig_Environment(
            $services['templating.twig.loader'],
            $args
        );

        $environment->addExtension(new \Twig_Extension_Debug());
        $environment->addExtension(new Twig_Extension_StringLoader());
        $environment->enableDebug();

        $environment->registerUndefinedFunctionCallback(array(__CLASS__, 'undefinedFunctions'));
        $environment->registerUndefinedFilterCallback(array(__CLASS__, 'undefinedFilters'));

        self::addCustomFunctions($environment);
        do_action('kb.twig.setup.environment', $environment);

        return $environment;
    }

    /**
     * @param \Twig_Environment $environment
     */
    private static function addCustomFunctions(\Twig_Environment $environment)
    {
        $getImage = new Twig_SimpleFunction(
            'getImage',
            function ($id, $width = null, $height = null, $crop = true, $single = true, $upscale = true) {
                return ImageResize::getInstance()->process($id, $width, $height, $crop, $single, $upscale);
            }
        );
        $environment->addFunction($getImage);
    }

    /**
     * @author Rarst | https://github.com/Rarst/meadow/
     * @param $func
     * @return bool|\Twig_SimpleFunction
     */
    public static function undefinedFunctions($func)
    {
        if (function_exists($func)) {
            return new \Twig_SimpleFunction(
                $func,
                function () use ($func) {
                    ob_start();
                    $return = call_user_func_array($func, func_get_args());
                    $echo = ob_get_clean();
                    return empty($echo) ? $return : $echo;
                },
                array('is_safe' => array('all'))
            );
        }

        return false;
    }

    /**
     * @author Rarst | https://github.com/Rarst/meadow/
     * @param $filter
     * @return \Twig_SimpleFilter
     */
    public static function undefinedFilters($filter)
    {
        return new \Twig_SimpleFilter(
            $filter,
            function () use ($filter) {

                return apply_filters($filter, func_get_arg(0));
            },
            array('is_safe' => array('all'))
        );
    }

    /**
     * Will prepend the path to the Loaders paths
     * @param $path
     */
    public static function setPath($path)
    {
        Kontentblocks::getService('templating.twig.loader')->prependPath($path);
    }
}