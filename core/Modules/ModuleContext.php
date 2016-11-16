<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Frontend\ModuleRenderSettings;


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

    public $renderPosition;

    public $renderer;

    /**
     * @var ModuleRenderSettings
     */
    public $renderSettings;

    /**
     * ModuleContext constructor.
     * @param PostEnvironment $environment
     * @param Module $module
     */
    public function __construct(PostEnvironment $environment, Module $module)
    {
        $this->set($environment->jsonSerialize());
        $this->areaContext = &$module->properties->areaContext;
        $this->areaId = &$module->properties->area->id;
    }

    /**
     * @param $attributes
     * @return $this
     */
    public function set($attributes)
    {
        if (is_array($attributes)) {
            foreach ($attributes as $k => $v) {
                if (property_exists($this, $k)) {
                    $this->$k = $v;
                }
            }
        }
        return $this;
    }

    /**
     * @param $prop
     * @param null $default
     * @return null
     */
    public function get($prop, $default = null)
    {
        if (property_exists($this, $prop)) {
            return $this->$prop;
        }
        return $default;
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