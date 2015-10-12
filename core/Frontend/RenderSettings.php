<?php

namespace Kontentblocks\Frontend;


use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Utils\Utilities;

/**
 * Class RenderSettings
 * @package Kontentblocks\Frontend
 */
class RenderSettings implements \ArrayAccess, \JsonSerializable
{

    /**
     * @var string
     */
    public $context = '';
    /**
     * @var string
     */
    public $subcontext = '';
    /**
     * @var string
     */
    public $wrapperClass = 'area';
    /**
     * @var bool
     */
    public $useWrapper = true;
    /**
     * @var string
     */
    public $element = 'div';
    /**
     * @var bool
     */
    public $mergeRepeating = false;
    /**
     * @var null
     */
    public $layout = null;
    /**
     * @var null
     */
    public $moduleElement = null;
    /**
     * @var null
     */
    public $view = null;
    /**
     * @var AreaProperties
     */
    public $area;

    /**
     * @param array $args
     * @param AreaProperties $area
     */
    public function __construct( $args = array(), AreaProperties $area )
    {
        $this->area = $area;
        $this->setupProperties( $args );
    }

    /**
     * @param $args
     */
    private function setupProperties( $args )
    {
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'wrapperClass' => 'area',
            'useWrapper' => true,
            'element' => apply_filters( 'kb.area.settings.element', 'div' ),
            'mergeRepeating' => false,
            'action' => null,
            'layout' => 'default',
            'moduleElement' => null,
            'view' => null
        );

        $defaults = Utilities::arrayMergeRecursive( $this->area->settings->export(), $defaults );

        $parsed = wp_parse_args( $args, $defaults );

        foreach ($parsed as $key => $value) {
            if (property_exists( $this, $key )) {
                $this->$key = $value;
            }
        }

    }

    /**
     * @param array $args
     */
    public function import( $args )
    {
        foreach ($args as $key => $value) {
            $this->offsetSet( $key, $value );
        }
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to set
     * @link http://php.net/manual/en/arrayaccess.offsetset.php
     * @param mixed $offset <p>
     * The offset to assign the value to.
     * </p>
     * @param mixed $value <p>
     * The value to set.
     * </p>
     * @return void
     */
    public function offsetSet( $offset, $value )
    {
        if (property_exists( $this, $offset )) {
            $this->$offset = $value;
        }
    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Whether a offset exists
     * @link http://php.net/manual/en/arrayaccess.offsetexists.php
     * @param mixed $offset <p>
     * An offset to check for.
     * </p>
     * @return boolean true on success or false on failure.
     * </p>
     * <p>
     * The return value will be casted to boolean if non-boolean was returned.
     */
    public function offsetExists( $offset )
    {

        return property_exists( $this, $offset ) && !empty( $this->$offset );

    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to retrieve
     * @link http://php.net/manual/en/arrayaccess.offsetget.php
     * @param mixed $offset <p>
     * The offset to retrieve.
     * </p>
     * @return mixed Can return all value types.
     */
    public function offsetGet( $offset )
    {
        return $this->get( $offset );

    }

    /**
     * @param $property
     * @return mixed| null
     */
    public function get( $property )
    {
        if (property_exists( $this, $property )) {
            return $this->$property;
        }
        return null;

    }

    /**
     * (PHP 5 &gt;= 5.0.0)<br/>
     * Offset to unset
     * @link http://php.net/manual/en/arrayaccess.offsetunset.php
     * @param mixed $offset <p>
     * The offset to unset.
     * </p>
     * @return void
     */
    public function offsetUnset( $offset )
    {
        if (property_exists( $this, $offset )) {
            unset( $this->$offset );
        }
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
        return $this->export();
    }

    /**
     * @return array
     */
    public function export()
    {
        $props = get_object_vars( $this );
        unset( $props['area'] );
        return $props;
    }
}