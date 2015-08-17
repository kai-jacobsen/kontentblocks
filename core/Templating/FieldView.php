<?php

namespace Kontentblocks\Templating;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;

class FieldView
{

    protected $data;
    protected $tplFile;
    protected $engine;
    protected $path;
    protected $I18n;

    public function __construct( $tpl = false, $data = null )
    {

        $this->data = $data;
        $this->I18n = I18n::getInstance();
        $this->tplFile = ( $tpl !== false ) ? $tpl : null;
        $this->setPath(KB_PLUGIN_PATH . 'core/Fields/Definitions/templates/');
        $this->setPath(KB_PLUGIN_PATH . 'core/Fields/Customizer/templates/');
        $this->engine = Kontentblocks::getService( 'templating.twig.fields' );

    }

    public function render( $echo = false )
    {
        if ($echo) {
            $this->engine->display( $this->tplFile, $this->data );
        } else {
            return $this->engine->render( $this->tplFile, $this->data );
        }

    }

    public function setPath( $path )
    {
        Twig::setPath( $path );

    }

}
