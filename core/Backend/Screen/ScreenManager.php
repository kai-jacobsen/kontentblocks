<?php

namespace Kontentblocks\Backend\Screen;

use Exception;
use Kontentblocks\Backend\Environment\Environment;

class ScreenManager
{

    /**
     * Raw areas are all areas which are available in the current environment
     * e.g. are assigned to current page template and/or post type
     * @var array
     * @since 0.1.0
     */
    protected $areas;

    /**
     * Environment Instance
     * @var \Kontentblocks\Backend\Environment\Environment
     * @since 0.1.0
     */
    protected $Environment;

    /**
     * Definition of possible sections for the edit screen
     * A context does not get rendered if there are no areas
     * assigned to it.
     * @var array
     * @since 0.1.0
     */
    protected $contextLayout;

    /**
     * Final sorted assignment of areas to contexts
     * @var array
     * @since 0.1.0
     */
    protected $contexts;

    /**
     * Indicates if sidebars exists or not
     * @var boolean
     * @since 0.1.0
     */
    protected $hasSidebar;

    /**
     * Class Constructor
     *
     * @param $areas
     * @param Environment $Environment
     *
     */
    public function __construct( $areas, Environment $Environment )
    {
        // setup raw areas
        $this->areas = $areas;
        // set this environment


        $this->Environment = $Environment;
        //setup region layout
        $this->contextLayout = self::getDefaultContextLayout();
        // setup filtered areas
        $this->contexts = $this->areasSortedByContext( $this->areas );
        // test if final context layout includes an sidebar
        // e.g. if an non-dynamic area is assigned to 'side'
        $this->hasSidebar = ( !empty( $this->contexts['side'] ) && !empty( $this->contexts['normal'] ) );
    }


    /**
     * Instantiate a context object for each context and render
     * @since 0.1.0
     */
    public function render()
    {

        foreach ($this->contextLayout as $args) {
            // delegate the actual output to ScreenContext
            $context = new ScreenContext(
                $args,
                $this->getContextAreas( $args['id'] ),
                $this->Environment,
                $this->hasSidebar()
            );
            $context->render();
        }

    }

    /**
     * Sort raw Area definitions to array
     * @throws Exception
     * @return array
     * @since 0.1.0
     */
    public function areasSortedByContext()
    {
        $areas = array();
        $contextsOrder = $this->Environment->getDataProvider()->get( 'kb.contexts' );


        if (!$this->areas) {
            return array();
        }

        foreach ($this->areas as $area) {
//            if (!$area->dynamic) {
                $areas[$area->context][$area->id] = $area;
//            }
        }


        if (is_array( $contextsOrder ) && !empty( $contextsOrder )) {
            foreach ($contextsOrder as $context => $areaIds) {
                if (is_array($areaIds)){
                    foreach (array_reverse(array_keys($areaIds)) as $areaId) {
                        if (isset($areas[$context][$areaId])){
                            $tmp = $areas[$context][$areaId];
                            unset($areas[$context][$areaId]);
                            $areas[$context] = array($areaId => $tmp) + $areas[$context];
                        }
                    }
                }
            }
        }
        return $areas;
    }


    /**
     * Getter to retrieve areas by context id
     *
     * @param $contextId
     *
     * @return array
     * @since 0.1.0
     */
    public function getContextAreas( $contextId )
    {
        if (isset( $this->contexts[$contextId] )) {
            return $this->contexts[$contextId];
        } else {
            return array();
        }

    }

    /**
     * Getter for all areas
     * @return array
     * @since 0.1.0
     */
    public function getAreas()
    {
        return $this->areas;

    }

    /**
     * Getter for Environment instance
     * @return Environment
     * @since 0.1.0
     */
    public function getEnvironment()
    {
        return $this->Environment;
    }


    /**
     * Default Context Layout
     *
     * @return array default context layout
     * @filter kb_default_context_layout
     * @since 0.1.0
     */
    public static function getDefaultContextLayout()
    {
        $defaults = array(
            'top' => array(
                'id' => 'top',
                'title' => __( 'Header', 'kontentblocks' ),
                'description' => apply_filters( 'kb_context_description_top', '' )
            ),
            'normal' => array(
                'id' => 'normal',
                'title' => __( 'Content', 'kontentblocks' ),
                'description' => apply_filters( 'kb_context_description_content', '' )
            ),
            'side' => array(
                'id' => 'side',
                'title' => __( 'Sidebar', 'kontentblocks' ),
                'description' => apply_filters( 'kb_context_description_side', '' )
            ),
            'bottom' => array(
                'id' => 'bottom',
                'title' => __( 'Footer', 'kontentblocks' ),
                'description' => apply_filters( 'kb_context_description_bottom', '' )
            )
        );

        // plugins may change this
        return apply_filters( 'kb_default_context_layout', $defaults );

    }


    /**
     * Get sidebar indicator flag
     * @return bool
     * @since 0.1.0
     */
    public function hasSidebar()
    {
        return $this->hasSidebar;
    }

}
