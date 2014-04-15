<?php

namespace Kontentblocks\Templating;

class CoreTemplate
{

    protected $data;
    protected $tplFile;
    protected $engine;
    protected $path;

    public function __construct( $tpl = false, $data = array() )
    {

        $this->data    = $data;
        $this->tplFile = ($tpl !== false) ? $tpl : null;
        $this->path    = KB_PLUGIN_PATH . 'core/Templating/templates/';
        $this->engine  = Twig::getInstance();

        //initial path
        $this->setPath($this->path);

    }

    public function render( $echo = false )
    {
        if ( !is_file( trailingslashit( $this->path ) . $this->tplFile ) ) {
            echo "<script>console.log('template {$this->tplFile} missing');</script>";
            return false;
        }


        if ( $echo ) {
            $this->engine->display( $this->tplFile, $this->data );
        }
        else {
            return $this->engine->render( $this->tplFile, $this->data );
        }
        
        return false;
    }

    public function setPath( $path )
    {
        $this->path = $path;
        Twig::setPath( $path );
    }

    public function __destruct()
    {
        Twig::resetPath();

    }

}
