<?php

namespace Kontentblocks\Backend\Areas;

use Kontentblocks\Backend\API\AreaTableAPI;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Language\I18n;

/**
 * Area Registry
 * -----------------------------
 * Collects all registered areas
 * Collects all registered area templates
 * Handles the connection Module > Area
 * @since 1.0.0
 */
class AreaRegistry
{

    /**
     * All register areas
     * @var array
     * @since 1.0.0
     */
    protected $rawAreas = array();

    /**
     * Global areas with context 'side' filtered
     * @var array
     * @since 1.0.0
     */
    protected $globalSidebars = array();

    /**
     * all global areas filtered
     * @var array
     * @since 1.0.0
     */
    protected $globalAreas = array();

    /**
     * area templates
     * @var array
     * @since 1.0.0
     */
    protected $templates = array();

    /**
     * this instance
     * @var object self
     * @since 1.0.0
     */
    static $instance;

    /**
     * Singleton Pattern
     * Get the Instance of the Area Directory
     * original instantiated on plugin startup
     * @return object | Area directory instance
     * @since 1.0.0
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
            self::$instance->init();
        }

        return self::$instance;

    }

    /**
     * Init Function
     * Gets areas which were added by the user through the admin interface
     * Adds those areas to the directory
     *
     * @return void
     * @since 1.0.0
     */
    public function init()
    {
        $areas = get_posts(
            array(
                'post_type' => 'kb-dyar',
                'posts_per_page' => -1,
                'suppress_filters' => false
            )
        );

        if (!empty($areas)) {
            foreach ($areas as $areapost) {
                $area = get_post_meta($areapost->ID, '_area', true);
                $area['parent_id'] = $areapost->ID;
                $dynamicAreas[] = $area;
            }
        }

        if (!empty($dynamicAreas)) {
            foreach ($dynamicAreas as $area) {
                $this->addArea($area, false);
            }
        }

    }

    /**
     * Adds an area to the registry
     * Merges default arguments with provided arguments
     * $Manual indicates if the area has been registered by code (true) or
     * was added through the admin interface (false)
     *
     * @param array $args
     * @param bool $manual
     * @return void
     * @since 1.0.0
     */
    public function addArea($args, $manual = true)
    {
        if (!empty($args['id'])) {
            $args['id'] = sanitize_title($args['id']);
        }

        // merge defaults with provided args
        $area = wp_parse_args($args, self::getDefaults($manual));
        if (empty($this->rawAreas[$area['id']])) {
            $this->rawAreas[$area['id']] = $area;
        } else {
            $this->rawAreas[$area['id']] = wp_parse_args($this->rawAreas[$area['id']], $area);
        }

        $this->preFilterAreas($this->rawAreas[$area['id']]);
    }

    /**
     * Returns an area from the registry by id
     * @param string $id
     * @return mixed null if area is not set | area array args if area is set
     * @since 1.0.0
     */
    public function getArea($id)
    {
        if (isset($this->rawAreas[$id])) {
            return $this->rawAreas[$id];
        } else {
            return null;
        }

    }

    /**
     * Retrieve all areas in given context
     * @param string $context
     * @return array
     * @since 1.0.0
     */
    public function getAreasByContext($context)
    {
        return array_filter($this->rawAreas, function ($area) use ($context) {
            return ($area['context'] === $context);
        });
    }

    /**
     * Getter for global sidebars
     * @return array
     * @since 1.0.0
     */
    public function getGlobalSidebars()
    {
        return $this->globalSidebars;
    }

    /**
     * getter for global areas
     * @return array
     * @since 1.0.0
     */
    public function getGlobalAreas()
    {
        return $this->globalAreas;
    }


    /**
     * Sort areas to common used collections
     * @param $area
     * @since 1.0.0
     */
    public function preFilterAreas($area)
    {
        if ($area['dynamic'] === true
        ) {
            if ($area['context'] === 'side') {
                $this->globalSidebars[] = $area;
            } else {
                $this->globalAreas[] = $area;
            }
        }
    }


    /**
     * Returns all registered area templates
     * @return array of template definitions
     * @since 1.0.0
     */
    public function getTemplates()
    {
        return $this->templates;

    }

    /**
     * Registers an area template and adds it to the area templates array
     * @param array $args
     * @since 1.0.0
     */
    public function addTemplate($args)
    {

        $defaults = array(
            'templateClass' => '',
            'layout' => array(),
            'cycle' => false,
            'last-item' => false
        );

        if (!empty($args['id'])) {
            $this->templates[$args['id']] = wp_parse_args($args, $defaults);
        }

    }

    /**
     * Get a template by id
     * @param string $id
     * @return null | array of params
     * @since 1.0.0
     */
    public function getTemplate($id)
    {
        if (isset($this->templates[$id])) {
            return $this->templates[$id];
        } else {
            return NULL;
        }

    }

    /**
     * Modules can connect themselves to an area by specifying the connect parameter
     * This method handles the connection by adding the modules classname to the
     * assigned modules array of the area
     *
     * A Module can be added to all registered areas by setting connect to 'any'
     * A Module can be added to all registered areas of an specific context by settint connect
     * to one or more of the following words : 'top', 'normal', 'side', 'bottom'
     * @param string $classname
     * @param array $args module args
     */
    public function connect($classname, $args)
    {
        if (!empty($args['settings']['connect']) && $args['settings']['connect'] === 'any') {

            foreach ($this->rawAreas as $area_id => $area) {
                if ($area['assignedModules'] === NULL || !in_array($classname, $area['assignedModules'])) {
                    $this->rawAreas[$area_id]['assignedModules'][] = $classname;
                }
            }
        } else if (!empty($args['settings']['connect']) and is_array($args['settings']['connect'])) {
            $update = false;


            foreach ($args['settings']['connect'] as $id) {

                if (in_array($id, array('top', 'normal', 'side', 'bottom'))) {
                    foreach ($this->getAreasByContext($id) as $connection) {
                        $args['settings']['connect'] = array($connection['id']);
                        $this->connect($classname, $args);
                    }
                } else {

                    if (empty($this->rawAreas[$id])) {
                        continue;
                    }

                    $area = $this->rawAreas[$id];

                    if (!in_array($classname, $area['assignedModules'])) {
                        $area['assignedModules'][] = $classname;
                    }
                    $this->rawAreas[$id] = $area;
                }
            }
        }
    }

    /**
     * Filters registered areas by post settings
     * This needs an instance of the PostEnvironment Class to provide
     * all necessary informations for the filter
     * Areas can be limited to post types and/or page templates
     * @param \Kontentblocks\Backend\Environment\PostEnvironment $postData
     * @return boolean
     * @since 1.0.0
     */
    public function filterForPost(PostEnvironment $postData)
    {

        $pageTemplate = $postData->get('pageTemplate');
        $postType = $postData->get('postType');

        // bail out if this is a redirect template
        if (false !== strpos($pageTemplate, 'redirect')) {
            return false;
        }

        //declare var
        $areas = array();

        // loop through areas and find all which are attached to this post type and/or page template
        foreach ($this->rawAreas as $area) {

            if (empty($area['context'])) {
                $area['context'] = 'side';
            }

            if ((!empty($area['pageTemplates'])) && (!empty($area['postTypes']))) {
                if (in_array($pageTemplate, $area['pageTemplates']) && in_array($postType, $area['postTypes'])) {
                    $areas[$area['id']] = $area;
                }
            } elseif (!empty($area['pageTemplates'])) {
                if (in_array($pageTemplate, $area['pageTemplates'])) {
                    $areas[$area['id']] = $area;
                }
            } elseif (!empty($area['postTypes'])) {
                if (in_array($postType, $area['postTypes'])) {
                    $areas[$area['id']] = $area;
                }
            }
        }
        $sareas = self::orderBy($areas, 'order');
        return $sareas;

    }

    /**
     * Private helper method to order the areas array by a specified field
     * i.e. order
     *
     * @param array $areas
     * @param string $field
     * @return array
     * @since 1.0.0
     */
    private
    function orderBy($areas, $field)
    {
        $code = "return strnatcmp(\$a['$field'], \$b['$field']);";
        uasort($areas, create_function('$a,$b', $code));
        return $areas;

    }

    /**
     * Normalize each area by passing it through this method
     *
     * @param bool $manual
     * @return array
     * @since 1.0.0
     */
    public static function getDefaults($manual = true)
    {
        return array(
            'id' => '', // unique id of area
            'name' => '', // public shown name
            'description' => '', // public description
            'postTypes' => array(), // array of post types where this area is available to
            'pageTemplates' => array(), // array of page template names where this area is available to
            'assignedModules' => array(), // array of classnames
            'layouts' => array(), // array of area template ids
            'defaultTpl' => 'default', // default Tpl to use, if none is set
            'dynamic' => false, // whether this is an dynamic area
            'manual' => $manual, // true if set by code
            'limit' => 0, // how many blocks are allowed
            'order' => 0, // order index for sorting
            'context' => 'normal', // location on the edit screen
        );

    }

    /**
     * Check if an area id already exists
     * @param string $id
     * @return bool
     * @since 1.0.0
     */
    public function areaExists($id)
    {
        if (isset($this->rawAreas[$id])) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if area is dynamic
     * @param $id
     * @return mixed
     * @since 1.0.0
     */
    public function isDynamic($id)
    {
        $area = $this->getArea($id);
        return $area['dynamic'];
    }

}
