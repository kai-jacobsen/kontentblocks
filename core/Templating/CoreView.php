<?php

namespace Kontentblocks\Templating;

use Kontentblocks\Kontentblocks;

/**
 * Class CoreView
 * internal use only
 * @package Kontentblocks\Templating
 */
class CoreView
{
    /**
     * Template data
     * @var array
     */
    protected $data;

    /**
     * Template file
     * @var string
     */
    protected $tplFile;

    /**
     * @var \Kontentblocks\Templating\Twig
     */
    protected $engine;

    /**
     * Absolute path to templates
     * @var string
     */
    protected $path;

    /**
     * @param bool $tpl
     * @param array $data
     */
    public function __construct( $tpl = null, $data = array() )
    {
        if (strpos( $tpl, WP_CONTENT_DIR) !== false){
            Twig::setPath(dirname($tpl));
            $tpl = basename($tpl);
        }

        $this->data = $data;
        $this->tplFile = $tpl;
        $this->path = KB_PLUGIN_PATH . 'core/Templating/templates/';


        /** @var \Kontentblocks\Templating\Twig $engine */
        $this->engine = Kontentblocks::getService( 'templating.twig.fields' );

        //initial path
        $this->setPath( $this->path );

    }

    /**
     *
     * @param bool $echo
     * @return bool|string
     */
    public function render( $echo = false )
    {

        if ($echo) {
            $this->engine->display( $this->tplFile, $this->data );
        } else {
            return $this->engine->render( $this->tplFile, $this->data );
        }

        return false;
    }

    /**
     * @param string $path
     */
    public function setPath( $path )
    {
        $this->path = $path;
        Twig::setPath( $path );
    }

}
