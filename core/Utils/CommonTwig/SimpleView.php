<?php

namespace Kontentblocks\Utils\CommonTwig;


/**
 * View
 */
class SimpleView
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
     * @var SimpleTwig
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
        $this->data = $data;
        $this->tplFile = $tpl;

        $this->engine = Kontentblocks()->getService('templating.twig.common');
    }

    public function addData( $data )
    {
        if (!is_array( $data )) {
            return null;
        }

        $this->data = wp_parse_args( $data, $this->data );
    }

    /**
     *
     * @param bool $echo
     * @return bool
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

}
