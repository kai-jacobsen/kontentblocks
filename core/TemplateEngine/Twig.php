<?php
namespace Kontentblocks\TemplateEngine;
class Twig
{

    private static $loader      = null;
    private static $environment = null;

    public static function getInstance()
    {


        if ( self::$loader === null ) {
            self::$loader = new \Twig_Loader_Filesystem( self::getDefaultPath() );
        }

        if ( self::$environment === null ) {
            self::$environment = new \Twig_Environment(
                self::$loader, array(
                'cache' => apply_filters( 'kb_twig_cache_path', WP_CONTENT_DIR . '/twigcache/' ),
                'auto_reload' => TRUE,
                'debug' => TRUE
                ) );
            self::$environment->addExtension(new \Twig_Extension_Debug());
        }
        

        return self::$environment;

    }

    public static function getDefaultPath()
    {
        return apply_filters( 'kb_twig_def_path', get_stylesheet_directory() . '/module-templates/' );

    }

    protected function __construct()
    {
        
    }

    private function __clone()
    {
        
    }

    public static function setPath( $path )
    {
        $paths = array();
        $paths[] = $path;
        $paths[] = self::getDefaultPath();
        
        self::$loader->addPath( $path );
    }

    public static function resetPath()
    {
        self::$loader->setPaths( self::getDefaultPath() );

    }

}