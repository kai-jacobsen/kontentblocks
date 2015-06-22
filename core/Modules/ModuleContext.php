<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Environment\Environment;


/**
 * Class ModuleContext
 * @package Kontentblocks\Modules
 */
class ModuleContext implements \JsonSerializable
{

    public $pageTemplate;

    public $postType;

    public $postId;

    public $areaId;

    public $areaContext;

    public $context;

    public $subcontext;

    public $areaTemplate;

    public function __construct( Environment $Environment, Module $Module )
    {
        $this->set( $Environment->jsonSerialize() );
        $this->areaContext = &$Module->Properties->areaContext;
        $this->areaId = &$Module->Properties->area->id;
    }

    /**
     * @param $attributes
     * @return $this
     */
    public function set( $attributes )
    {
        if (is_array( $attributes )) {
            foreach ($attributes as $k => $v) {
                if (property_exists( $this, $k )) {
                    $this->$k = $v;
                }
            }
        }
        return $this;
    }

    /**
     * @param $prop
     * @return null
     */
    public function get( $prop )
    {
        if (property_exists( $this, $prop )) {
            return $this->$prop;
        }
        return null;
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
        return get_object_vars($this);
    }
}