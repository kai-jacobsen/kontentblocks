<?php

namespace Kontentblocks\Areas;


class Area
{

    /**
     * @var string
     */
    public $id;

    /**
     * @var string
     */
    public $name;

    /**
     * @var string
     */
    public $description;

    /**
     * @var array
     */
    public $postTypes;

    /**
     * @var array
     */
    public $pageTemplates;

    /**
     * @var array
     */
    public $assignedModules;

    /**
     * @var array
     */
    public $layouts;

    /**
     * @var string
     */
    public $defaultLayout;

    /**
     * @var bool
     */
    public $dynamic;

    /**
     * @var bool
     */
    public $manual;

    /**
     * @var int
     */
    public $limit;

    /**
     * @var int
     */
    public $order;

    /**
     * @var string
     */
    public $context;

    /**
     * @var bool
     */
    public $concat;

    /**
     * @var bool
     */
    public $sortable;

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
     *
     * @param bool $manual
     *
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