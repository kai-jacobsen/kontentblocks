<?php

namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\TermEnvironment;


/**
 * Class TermPanelContext
 */
class TermPanelContext implements \JsonSerializable
{

    /**
     * @var string
     */
    public $taxonomy;

    /**
     * @var int
     */
    public $termId;

    /**
     * @var \WP_Term
     */
    public $term;


    /**
     * @param TermEnvironment $environment
     * @param TermPanel $panel
     */
    public function __construct(TermEnvironment $environment, TermPanel $panel)
    {
        $this->set($environment->jsonSerialize());
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