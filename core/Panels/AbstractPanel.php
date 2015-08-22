<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Utils\Utilities;

/**
 * Class AbstractPanel
 * @package Kontentblocks\Panels
 */
abstract class AbstractPanel
{

    /**
     * Custom Field Manager Instance
     * @var PanelFieldController
     */
    public $fields;

    /**
     * @var array
     */
    protected $args;

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;

    /**
     * Form data
     * @var array
     */
    public $data = null;


    public static function run($args){
        // do nothing
    }

    abstract public function init();

    /**
     * Prepare and return data for user usage
     * @return mixed
     */
    abstract public function getData();

    public function setData( $data )
    {
        $this->data = $data;
    }

    /**
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @param null $default
     * @return mixed
     */
    abstract public function getKey( $key = null, $default = null );

    public function getBaseId()
    {
        return $this->baseId;
    }


    protected function getType(){
        return $this->type;
    }

} 