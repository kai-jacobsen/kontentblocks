<?php
namespace Kontentblocks\Templating;
class ModuleTemplate
{

    protected $module;
    protected $data;
    protected $tplFile;
    protected $engine;

    public function __construct( $module, $tpl = false, $addData = false )
    {

        if ( !isset( $module ) || !is_object( $module ) ) {
            throw new Exception( 'Module is not set' );
        }

        $this->module  = $module;
        $this->data    = $this->_setupData( $module->moduleData, $addData );
        $this->tplFile = ($tpl !== false) ? $tpl : get_class( $module ) . '.twig';

        $this->engine = Twig::getInstance();
    }

    public function render( $echo = false )
    {
        if ( !empty( $this->module->path ) ) {
            if ( is_file( trailingslashit( $this->module->path ) . $this->tplFile ) ) {
                $this->setPath( $this->module->path );
            }
        }

        elseif ( !is_file( trailingslashit( Twig::getDefaultPath()) . $this->tplFile ) ) {
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
        Twig::resetPath();

    }

    /**
     * Setup Template Data
     * Merges Instance Data with optional additional data
     * sets up class property $data
     * @param array $modData
     * @param array $addData
     * @return array
     */
    private function _setupData( $modData, $addData )
    {
        if ( $addData ) {
            $data = wp_parse_args( $addData, $modData );
        }
        else {
            $data = $modData;
        }

        // make sure there is a key value pair, if not 
        // make 'data' the default key
        if ( !is_array( $data ) ) {
            $data = array(
                'data' => $data
            );
        }

        return $data;

    }

}