<?php
namespace Kontentblocks\Templating;

use Exception;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\MobileDetect;

/**
 * Class ModuleView
 * @package Kontentblocks\Templating
 */
class ModuleView implements \JsonSerializable
{

    /**
     * @var object  Module Instance
     */
    protected $module;

    /**
     * @var array   merged from module data and additional injected data
     */
    protected $data;

    /**
     * @var string filename of twig file
     */
    protected $tplFile;

    /**
     * @var TWIG engine
     */
    protected $engine;


    /**
     * Class Constructor
     *
     * @param \Kontentblocks\Modules\Module
     * @param bool $tpl
     * @param array $addData
     *
     * @throws Exception
     */
    public function __construct( Module $module, $tpl = null, $addData = array() )
    {


        if (!isset( $module ) || !is_object( $module )) {
            throw new \Exception( 'Module is not set' );
        }

        $this->module = $module;

        // merge module data and additional injected data
        $this->data = $this->_setupData( $module->model->export(), $addData );

        // if no tpl is given, set a default
        // @TODO Kinda useless, things should break in that case
        $this->tplFile = ( $tpl !== false ) ? $tpl : null;


        $this->engine = Kontentblocks::getService( 'templating.twig.public' );
    }

    public function render( $echo = false )
    {

        if (empty( $this->tplFile )) {
            return false; //@TODO template missing
        }

        if ($echo) {
            $this->engine->display( $this->tplFile, $this->data );
        } else {
            return $this->engine->render( $this->tplFile, $this->data );
        }

    }

    public function setPath( $path )
    {
        if (!empty( $path ) && is_dir( $path )) {
            Twig::setPath( $path );
        }

    }

    public function __destruct()
    {
        //Twig::resetPath();

    }

    /**
     * Setup Template Data
     * Merges Instance Data with optional additional data
     * sets up class property $data
     *
     * @param array $modData
     * @param array $addData
     *
     * @return array
     */
    private function _setupData( $modData, $addData )
    {
        if ($addData) {
            $data = wp_parse_args( $addData, $modData );
        } else {
            $data = $modData;
        }


        if (!is_array( $data )) {
            $data = array();
        }

        if (is_object( $this->module->getModel() )) {
            $data['Model'] = $this->module->getModel();
        }

        $data['module'] = $this->module->toJSON();

        // make sure there is a key value pair, if not
        // make 'data' the default key
        if (!is_array( $data )) {
            $data = array(
                'data' => $data
            );
        }

        $data['_utils'] = $this->setupUtilities();

        return $data;

    }

    private function setupUtilities()
    {
        return array(
            'MobileDetect' => Kontentblocks::getService( 'utility.mobileDetect' )
        );
    }

    public function addData( $data )
    {

        if (!is_array( $data )) {
            return false;
        }

        $this->module->model->set($data);
        $this->data = wp_parse_args( $data, $this->data );

        return true;
    }

    public function setTplFile( $file )
    {
        $this->tplFile = $file;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return array(
            'viewfile' => $this->tplFile,
            'data' => $this->data
        );
    }
}

