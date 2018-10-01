<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\EditScreens\ScreenManager;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\Utilities;

/**
 * Area Registry
 * -----------------------------
 * Collects all registered areas
 * Collects all registered area templates
 * Handles the connection Module > Area
 */
class AreaRegistry
{

    /**
     * All register areas
     * @var array
     * @since 0.1.0
     */
    protected $areas = array();

    /**
     * Global areas with context 'side' filtered
     * @var array
     * @since 0.1.0
     */
    protected $globalSidebars = array();

    /**
     * all global areas filtered
     * @var array
     * @since 0.1.0
     */
    protected $globalAreas = array();

    /**
     * area templates
     * @var array
     * @since 0.1.0
     */
    protected $templates = array();

    /**
     * @var AreaDynamicManager
     */
    protected $areaDynamicManager;


    protected $reserved = array();


    /**
     * Constructer
     */
    public function __construct()
    {
        $this->areaDynamicManager = new AreaDynamicManager();
        // action is triggerd by AreaDynamicManager setup
        // to make sure external areas are properly setup
        add_action('kb.areas.dynamic.setup', array($this, 'init'));
        add_action('wp_footer', array($this, 'setupJSON'), 8);
        $this->addInternalArea();
    }

    /**
     * Even if an area is not an actual requirement for the
     * consitency of a module, most frontend related code expects
     * at least an area model for internal control purposes.
     * If a module is not attached to a valid area, it's internally added
     * to a dummy area, which is created here.
     * This dummy area is ignored from any UI and does not exist publicly.
     */
    private function addInternalArea()
    {
        $this->addArea(
            array(
                'id' => '_internal',
                'internal' => true,
                'context' => 'normal'
            )
        );
    }

    /**
     * Adds an area to the registry
     * Merges default params with provided params
     * $Manual indicates if the area has been registered by code (true) or
     * was added through the admin interface (false)
     *
     * @param array $args
     * @param bool $manual
     * @return AreaProperties
     * @since 0.1.0
     */
    public function addArea($args, $manual = true)
    {
        if (!empty($args['id'])) {
            $args['id'] = sanitize_title($args['id']);
        }
        if (isset($args['dynamic']) && $args['dynamic']) {
            if (!isset($args['context'])) {
                $args['context'] = 'dynamic';
            }
        }

        $area = new AreaProperties($args);
        // merge defaults with provided args
        if ($area->dynamic === true && $manual) {
            $this->areaDynamicManager->add($area);
        }

        $this->areas[$area->id] = $area;
        $this->preFilterAreas($this->areas[$area->id]);
        return $area;
    }

    /**
     * Sort areas to common used collections
     *
     * @param $area
     *
     * @since 0.1.0
     */
    public function preFilterAreas($area)
    {
        if ($area->dynamic === true
        ) {
            if ($area->context === 'side') {
                $this->globalSidebars[$area->id] = $area;
            }

            $this->globalAreas[$area->id] = $area;

        }
    }

    /**
     * Init Function
     * Gets areas which were added by the user through the admin interface
     * Adds those areas to the directory
     *
     * @return void
     * @since 0.1.0
     */
    public function init()
    {
        $areas = wp_cache_get('dynamicareas', Utilities::getCacheGroup());

        if ($areas === false) {
            $areas = get_posts(
                array(
                    'post_type' => 'kb-dyar',
                    'posts_per_page' => -1,
                    'suppress_filters' => false // let multilanguage plugins set the right context
                )
            );
            wp_cache_add('dynamicareas', $areas, Utilities::getCacheGroup(), 60 * 60 * 6);
        }


        if (is_array($areas) && !empty($areas)) {
            foreach ($areas as $areapost) {
                $storage = new ModuleStorage($areapost->ID);
                $area = $storage->getDataProvider()->get('_area');
                $area['parent_id'] = $areapost->ID; //deprecated old key
                $area['parentObjectId'] = $areapost->ID;
                $dynamicAreas[] = $area;
            }
        }
        if (!empty($dynamicAreas)) {
            foreach ($dynamicAreas as $area) {
                $this->addArea($area, false);
            }
        }
        _K::info('Dynamic areas queried and setup');
        do_action('kb.areas.setup');
    }


    /**
     * Getter for global sidebars
     * @return array
     * @since 0.1.0
     */
    public function getGlobalSidebars()
    {
        return $this->globalSidebars;
    }

    /**
     * Returns all registered area templates
     * @return array of template definitions
     * @since 0.1.0
     */
    public function getTemplates()
    {
        return $this->templates;

    }

    /**
     * Registers an area template and adds it to the area templates array
     *
     * @param array $args
     *
     * @since 0.1.0
     */
    public function addTemplate($args)
    {

        $defaults = array(
            'templateClass' => '',
            'layout' => array(),
            'cycle' => false,
            'last-item' => false,
            'wrap' => false
        );

        if (!empty($args['id'])) {
            $this->templates[$args['id']] = wp_parse_args($args, $defaults);
        }

    }

    /**
     * Get a template by id
     *
     * @param string $tplId
     *
     * @return null | array of params
     * @since 0.1.0
     */
    public function getTemplate($tplId)
    {
        if (isset($this->templates[$tplId])) {
            return $this->templates[$tplId];
        }
        return null;

    }

    /**
     * Check if a template exists by id
     * @param $templateID
     * @return bool
     * @since 0.1.0
     */
    public function templateExists($templateID)
    {
        if (isset($this->templates[$templateID])) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Modules can connect themselves to an area by specifying the connect parameter
     * This method handles the connection by adding the modules classname to the
     * assigned modules array of the area
     *
     * A Module can be added to all registered areas by setting connect to 'any'
     * A Module can be added to all registered areas of an specific context by setting connect
     * to one or more of the following words : 'top', 'normal', 'side', 'bottom'
     *
     * @param string $classname
     * @param array $args module args
     * @return bool
     */
    public function connect($classname, $args)
    {
        $setting = $args['settings']['connect'];
        $postTypes = get_post_types_by_support('kontentblocks');
        if (empty($setting)) {
            return false;
        }
        if ($setting === 'any') {
            /** @var \Kontentblocks\Areas\AreaProperties $area */
            foreach ($this->areas as $area) {
                $area->connect($classname);
            }
        } else if (is_array($setting)) {
            foreach ($setting as $target) {
                // check for context
                if (in_array($target, array_keys(ScreenManager::getDefaultContextLayout()))) {
                    foreach ($this->getAreasByContext($target) as $connection) {
                        $args['settings']['connect'] = array($connection->id);
                        $this->connect($classname, $args);
                    }
                    // check for page template
                } else if (is_string($target) && (strpos($target, '.php') !== false || $target === 'default')) {
                    foreach ($this->getAreasByPageTemplate($target) as $tplcon) {
                        $args['settings']['connect'] = array($tplcon->id);
                        $this->connect($classname, $args);
                    }
                } else if ($target === 'global') {
                    foreach ($this->getGlobalAreas() as $connection) {
                        $connection->connect($classname);
                    }
                } else if (in_array($target, $postTypes)) {
                    foreach ($this->getAreasByPostType($target) as $area) {
                        $args['settings']['connect'] = array($area->id);
                        $this->connect($classname, $args);
                    }
                } else {
                    // its not a context, not a page template
                    // area id not existent
                    if (empty($this->areas[$target])) {
                        continue;
                    }
                    //area id exists, connect
                    /** @var \Kontentblocks\Areas\AreaProperties $area */
                    $area = $this->areas[$target];
                    $area->connect($classname);
                }
            }
        }
    }

    /**
     * Retrieve all areas in given context
     *
     * @param string $context
     *
     * @return array
     * @since 0.1.0
     */
    public function getAreasByContext($context)
    {
        return array_filter(
            $this->areas,
            function ($area) use ($context) {
                return ($area->context === $context);
            }
        );
    }

    /**
     * Get area which were assigned to a page template
     *
     * @param $tpl
     *
     * @return array
     */
    public function getAreasByPageTemplate($tpl)
    {
        return array_filter(
            $this->areas,
            function ($area) use ($tpl) {
                return Utilities::strposa($area->pageTemplates, $tpl);
            }
        );
    }

    /**
     * getter for global areas
     * @return array
     * @since 0.1.0
     */
    public function getGlobalAreas()
    {
        return $this->globalAreas;
    }

    /**
     * @param $pt
     * @return array
     */
    public function getAreasByPostType($pt)
    {
        return array_filter(
            $this->areas,
            function ($area) use ($pt) {
                return Utilities::strposa($area->postTypes, $pt);
            }
        );
    }

    /**
     * Filters registered areas by post settings
     * This needs an instance of the Environment Class to provide
     * all necessary informations for the filter
     * Areas can be limited to post types and/or page templates
     *
     * @param \Kontentblocks\Backend\Environment\PostEnvironment $environment
     *
     * @return array
     */
    public function filterForPost(PostEnvironment $environment)
    {

        $pageTemplate = $environment->getPageTemplate();
        $postType = $environment->getPostType();

        $areas = array();

        if ($postType === 'kb-gmd') {
            return array('global-module' => $this->getArea('global-module'));
        }
        if ($postType === 'kb-dyar') {
            return $this->getGlobalAreas();
        }

        // loop through areas and find all which are attached to this post type and/or page template
        /** @var \Kontentblocks\Areas\AreaProperties $area */
        foreach ($this->areas as $area) {

            $validArea = null;

            if (empty($area->context)) {
                $area->context = 'side';
            }
            if ((!empty($area->pageTemplates)) && (!empty($area->postTypes))) {
                if (Utilities::strposa($pageTemplate, $area->pageTemplates) && in_array(
                        $postType,
                        $area->postTypes
                    )
                ) {
                    $validArea = $area;
                }
            } elseif (!empty($area->pageTemplates)) {
                if (Utilities::strposa($pageTemplate, $area->pageTemplates)) {
                    $validArea = $area;
                }
            } elseif (!empty($area->postTypes)) {
                if (in_array($postType, $area->postTypes)) {
                    $validArea = $area;
                }
            }

            if (is_callable($area->showCallback)) {
                $res = call_user_func_array($area->showCallback, array($environment, $area));
                if ($res === true) {
                    $validArea = $area;
                }
            }


            if (!is_null($validArea)) {
                $areas[$area->id] = $validArea;
            }
        }
        $sareas = self::orderBy($areas, 'order');
        return $sareas;

    }

    /**
     * Returns an area from the registry by id
     *
     * @param string $areaId
     *
     * @return mixed null if area is not set | area array args if area is set
     * @since 0.1.0
     */
    public function getArea($areaId)
    {
        if (isset($this->areas[$areaId])) {
            array_push($this->reserved, $areaId);
            return $this->areas[$areaId];
        } else {
            return null;
        }

    }

    /**
     * Private helper method to order the areas array by a specified field
     * i.e. order
     * @param array $areas
     * @param string $field
     * @return array
     */
    private function orderBy($areas, $field)
    {


        uasort($areas, function ($a, $b) use ($field) {
            return strnatcmp($a->$field, $b->$field);
        });
        return $areas;
    }

    /**
     * Check if an area id already exists
     *
     * @param $areaId
     * @return bool
     */
    public function areaExists($areaId)
    {
        return isset($this->areas[$areaId]);
    }

    /**
     * Check if area is dynamic
     * @param $areaId
     * @return mixed
     */
    public function isDynamic($areaId)
    {
        $area = $this->getArea($areaId);

        if (is_object($area)) {
            return $area->dynamic;
        }

        return false;

    }

    /**
     * register area templates to frontend access
     * register dummy area for frontend access
     */
    public function setupJSON()
    {
        Utilities::setupCats();
        Kontentblocks::getService('utility.jsontransport')->registerData('AreaTemplates', null, $this->templates);
        Kontentblocks::getService('utility.jsontransport')->registerArea($this->getArea('_internal'));
    }

}
