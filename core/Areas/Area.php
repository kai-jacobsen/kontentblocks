<?php

namespace Kontentblocks\Areas;


/**
 * Class Area
 * @package Kontentblocks\Areas
 */
class Area
{

    /**
     * area identifier
     * @var string
     */
    public $id;

    /**
     * area human readable name
     * @var string
     */
    public $name;

    /**
     * optional description
     * @var string
     */
    public $description;

    /**
     * post types filter
     * @var array
     */
    public $postTypes;

    /**
     * page templates filter
     * @var array
     */
    public $pageTemplates;

    /**
     * modules available in this area
     * @var array
     */
    public $assignedModules;

    /**
     * layouts set to this area
     * @var array
     */
    public $layouts;

    /**
     * default layout if not otherwise stored
     * @var string
     */
    public $defaultLayout;

    /**
     * whether created sitewide or not
     * @var bool
     */
    public $dynamic;

    /**
     * created programmatically or not
     * @var bool
     */
    public $manual;

    /**
     * number of allowed modules
     * @var int
     */
    public $limit;

    /**
     * order index
     * @var int
     */
    public $order;

    /**
     * screen context
     * @var string
     */
    public $context;

    /**
     * concat public to post_content or not
     * @var bool
     */
    public $concat;

    /**
     * sortable on frontend
     * @var bool
     */
    public $sortable;

    /**
     * Construct and setup properties
     * @param $properties
     */
    public function __construct( $properties )
    {

        $properties = wp_parse_args( $properties, $this->getDefaults() );

        foreach ($properties as $k => $v) {
            if (method_exists( $this, 'set' . ucfirst( $k ) )) {
                $this->{'set' . ucfirst( $k )}( $v );
            } else {
                $this->$k = $v;
            }
        }
    }

    /**
     * Get property
     * @param string $prop
     * @return mixed|null
     */
    public function get( $prop )
    {
        if (property_exists( $this, $prop )) {
            return $this->$prop;
        }

        return null;
    }

    /**
     * Set property
     * @param string $prop
     * @param mixed $value
     */
    public function set( $prop, $value )
    {
        $this->$prop = $value;
    }


    /**
     * Add module classname to assigned modules array
     * @param string $module
     * @return $this
     */
    public function connect( $module )
    {
        if (!isset( $this->assignedModules[$module] )) {
            $this->assignedModules[] = $module;
        }
        return $this;
    }

    /**
     * Normalize each area by passing it through this method
     * @param bool $manual
     * @return array
     * @since 1.0.0
     */
    private function getDefaults( $manual = true )
    {
        return array(
            'id' => '', // unique id of area
            'name' => '', // public shown name
            'description' => '', // public description
            'postTypes' => array(), // array of post types where this area is available to
            'pageTemplates' => array(), // array of page template names where this area is available to
            'assignedModules' => array(), // array of classnames
            'layouts' => array(), // array of area template ids
            'defaultLayout' => 'default', // default Tpl to use, if none is set
            'dynamic' => false, // whether this is an dynamic area
            'manual' => $manual, // true if set by code
            'limit' => 0, // how many blocks are allowed
            'order' => 0, // order index for sorting
            'context' => 'normal', // location on the edit screen
            'concat' => false,
            'sortable' => false
        );
    }

}