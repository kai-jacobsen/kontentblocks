<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\Utilities;

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
    protected $areas = array();

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


    protected $AreaDynamicManager;


    protected $reserved = array();

    /**
     * Constructer
     */
    public function __construct()
    {
        $this->AreaDynamicManager = new AreaDynamicManager();

        add_action( 'kb.areas.dynamic.setup', array( $this, 'init' ) );
        if (is_user_logged_in()) {
            add_action( 'wp_footer', array( $this, 'setupJSON' ), 8 );
        }

        $this->addMockArea();
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
                'posts_per_page' => - 1,
                'suppress_filters' => false
            )
        );

        if (!empty( $areas )) {
            foreach ($areas as $areapost) {
                $Storage = new ModuleStorage( $areapost->ID );
                $area = $Storage->getDataProvider()->get( '_area' );
                $area['parent_id'] = $areapost->ID;
                $dynamicAreas[] = $area;
            }
        }

        if (!empty( $dynamicAreas )) {
            foreach ($dynamicAreas as $area) {
                $this->addArea( $area, false );
            }
        }

        _K::info( 'Dynamic areas queried and setup' );

        do_action( 'kb.areas.setup' );
    }

    /**
     * Adds an area to the registry
     * Merges default arguments with provided arguments
     * $Manual indicates if the area has been registered by code (true) or
     * was added through the admin interface (false)
     *
     * @param array $args
     * @param bool $manual
     *
     * @return void
     * @since 1.0.0
     */
    public function addArea( $args, $manual = true )
    {

        if (!empty( $args['id'] )) {
            $args['id'] = sanitize_title( $args['id'] );
        }

        $Area = new AreaProperties( $args );
        // merge defaults with provided args
        if ($Area->dynamic === true && $manual) {
            $this->AreaDynamicManager->add( $Area );
        }

        if (empty( $this->areas[$Area->id] )) {
            $this->areas[$Area->id] = $Area;
        }
        $this->preFilterAreas( $this->areas[$Area->id] );
    }

    /**
     * Returns an area from the registry by id
     *
     * @param string $id
     *
     * @return mixed null if area is not set | area array args if area is set
     * @since 1.0.0
     */
    public function getArea( $id )
    {
        if (isset( $this->areas[$id] )) {
            array_push( $this->reserved, $id );
            return $this->areas[$id];
        } else {
            return null;
        }

    }

    /**
     * Retrieve all areas in given context
     *
     * @param string $context
     *
     * @return array
     * @since 1.0.0
     */
    public function getAreasByContext( $context )
    {
        return array_filter(
            $this->areas,
            function ( $area ) use ( $context ) {
                return ( $area->context === $context );
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
    public function getAreasByPageTemplate( $tpl )
    {
        return array_filter(
            $this->areas,
            function ( $area ) use ( $tpl ) {
                return ( in_array( $tpl, $area->pageTemplates ) );
            }
        );
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
     *
     * @param $area
     *
     * @since 1.0.0
     */
    public function preFilterAreas( $area )
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
     *
     * @param array $args
     *
     * @since 1.0.0
     */
    public function addTemplate( $args )
    {

        $defaults = array(
            'templateClass' => '',
            'layout' => array(),
            'cycle' => false,
            'last-item' => false,
            'wrap' => false
        );

        if (!empty( $args['id'] )) {
            $this->templates[$args['id']] = wp_parse_args( $args, $defaults );
        }

    }

    /**
     * Get a template by id
     *
     * @param string $id
     *
     * @return null | array of params
     * @since 1.0.0
     */
    public function getTemplate( $id )
    {
        if (isset( $this->templates[$id] )) {
            return $this->templates[$id];
        } else {
            return null;
        }

    }


    /**
     * Check if a template exists by id
     * @param $id
     * @return bool
     * @since 1.0.0
     */
    public function templateExists( $id )
    {
        if (isset( $this->templates[$id] )) {
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
     * A Module can be added to all registered areas of an specific context by settint connect
     * to one or more of the following words : 'top', 'normal', 'side', 'bottom'
     *
     * @param string $classname
     * @param array $args module args
     */
    public function connect( $classname, $args )
    {
        $setting = $args['settings']['connect'];

        if (!empty( $setting ) && $setting === 'any') {
            /** @var \Kontentblocks\Areas\AreaProperties $Area */
            foreach ($this->areas as $Area) {
                $Area->connect( $classname );
            }
        } else if (!empty( $setting ) and is_array( $setting )) {
            foreach ($setting as $id) {
                // check for context
                if (in_array( $id, array( 'top', 'normal', 'side', 'bottom' ) )) {
                    foreach ($this->getAreasByContext( $id ) as $connection) {
                        $args['settings']['connect'] = array( $connection->id );
                        $this->connect( $classname, $args );
                    }
                } else if (is_string( $id ) && ( strpos( $id, '.php' ) !== false || $id === 'default' )) {
                    foreach ($this->getAreasByPageTemplate( $id ) as $tplcon) {
                        $args['settings']['connect'] = array( $tplcon->id );
                        $this->connect( $classname, $args );
                    }
                } else {
                    if (empty( $this->areas[$id] )) {
                        continue;
                    }
                    /** @var \Kontentblocks\Areas\AreaProperties $Area */
                    $Area = $this->areas[$id];
                    $Area->connect( $classname );
                }
            }
        }
    }

    /**
     * Filters registered areas by post settings
     * This needs an instance of the Environment Class to provide
     * all necessary informations for the filter
     * Areas can be limited to post types and/or page templates
     *
     * @param \Kontentblocks\Backend\Environment\Environment $postData
     *
     * @return boolean
     * @since 1.0.0
     */
    public function filterForPost( Environment $postData )
    {

        $pageTemplate = $postData->getPageTemplate();
        $postType = $postData->getPostType();
        $areas = array();

        // bail out if this is a redirect template
        if (false !== strpos( $pageTemplate, 'redirect' )) {
            return false;
        }

        if ($postType === 'kb-dyar'){
            return $this->getGlobalAreas();
        }


        // loop through areas and find all which are attached to this post type and/or page template
        /** @var \Kontentblocks\Areas\AreaProperties $area */
        foreach ($this->areas as $area) {

            if (empty( $area->context )) {
                $area->context = 'side';
            }
            if (( !empty( $area->pageTemplates ) ) && ( !empty( $area->postTypes ) )) {
                if (in_array( $pageTemplate, $area->pageTemplates ) && in_array( $postType, $area->postTypes )) {
                    $areas[$area->id] = $area;
                }
            } elseif (!empty( $area->pageTemplates )) {
                if (in_array( $pageTemplate, $area->pageTemplates )) {
                    $areas[$area->id] = $area;
                }
            } elseif (!empty( $area->postTypes )) {
                if (in_array( $postType, $area->postTypes )) {
                    $areas[$area->id] = $area;
                }
            }
        }
        $sareas = self::orderBy( $areas, 'order' );
        return $sareas;

    }

    /**
     * Private helper method to order the areas array by a specified field
     * i.e. order
     *
     * @param array $areas
     * @param string $field
     *
     * @return array
     * @since 1.0.0
     */
    private function orderBy( $areas, $field )
    {
        $code = "return strnatcmp(\$a->$field, \$b->$field);";
        uasort( $areas, create_function( '$a,$b', $code ) );
        return $areas;
    }

    /**
     * Check if an area id already exists
     *
     * @param $areaId
     * @return bool
     *
     * @since 1.0.0
     */
    public function areaExists( $areaId )
    {
        return isset( $this->areas[$areaId] );
    }

    /**
     * Check if area is dynamic
     *
     * @param $id
     *
     * @return mixed
     * @since 1.0.0
     */
    public function isDynamic( $id )
    {
        $area = $this->getArea( $id );
        return $area->dynamic;
    }

    public function setupJSON()
    {
        Utilities::setupCats();
        Kontentblocks::getService( 'utility.jsontransport' )->registerData( 'AreaTemplates', null, $this->templates );
        Kontentblocks::getService( 'utility.jsontransport' )->registerArea( $this->getArea( '_internal' ) );


    }

    private function addMockArea()
    {
        $this->addArea(
            array(
                'id' => '_internal',
                'internal' => true,
                'context' => 'normal'
            )
        );
    }

}
