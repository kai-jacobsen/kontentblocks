<?php

namespace Kontentblocks\Templating;

class FieldTemplate
{

    protected $data;
    protected $tplFile;
    protected $engine;
    protected $path;
    protected $I18n;

    public function __construct( $tpl = false, $data = null )
    {

        $this->data    = $data;
        $this->I18n    = \Kontentblocks\Language\I18n::getInstance();
        $this->tplFile = ($tpl !== false) ? $tpl : null;
        $this->path    = KB_PLUGIN_PATH . 'core/Fields/Definitions/templates/';
        $this->engine  = Twig::getInstance();

    }

    public function render( $echo = false )
    {
        $this->setPath($this->path);

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

    }

    public function setPath( $path )
    {

        Twig::setPath( $path );

    }

    public function __destruct()
    {
//        Twig::resetPath();

    }

}
