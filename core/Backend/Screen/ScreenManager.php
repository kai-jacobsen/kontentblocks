<?php

namespace Kontentblocks\Backend\Screen;

use Kontentblocks\Backend\Environment\PostEnvironment;

class ScreenManager
{

    /**
     * Raw areas are all areas which are available in the current environment
     * e.g. are assigned to current page template and/or post type
     * @var array
     */
    protected $rawAreas;

    /**
     * TODO: What is this?
     * @var array
     */
    protected $postAreas;

    /**
     * Environment Instance
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    protected $Environment;

    /**
     * Definition of possible sections for the edit screen
     * A context does not get rendered if there are no areas
     * assigned to it.
     * @var array
     */
    protected $contextLayout;

    /**
     * Final sorted assignment of areas to regions
     * TODO: Var name sucks
     * @var array
     */
    protected $regions;

    /**
     * Indicates if sidebars exists or not
     * @var boolean
     */
    protected $hasSidebar;

    /**
     * Class Constructor
     * @param PostEnvironment $Environment
     * @throws \Exception
     */
    public function __construct(PostEnvironment $Environment)
    {
        // get areas available
        // TODO wrong! shouldn't raise an exception, do nothing instead
        if (empty($Environment->get('areas'))) {
            throw new \Exception('ScreenManager needs areas!');
        }

        // set this environment
        $this->Environment = $Environment;
        //setup region layout
        $this->contextLayout = self::getDefaultContextLayout();
        // setup raw areas
        $this->rawAreas = $Environment->get('areas');
        // setup filtered areas
        $this->regions = $this->areasSortedByRegion($this->rawAreas);
        // test if final context layout includes an sidebar
        // e.g. if an non-dynamic area is assigned to 'side'
        $this->hasSidebar = $this->evaluateLayout();
    }


    /**
     * Instantiate a context object for each context and render
     * @since 1.0.0
     */
    public function render()
    {
        foreach ($this->contextLayout as $contextId => $args) {
            // delegate the actual output to ScreenContext
            $context = new ScreenContext($args, $this);
            $context->render();
        }

    }

    /**
     * Sort raw Area definitions to array
     * @throws Exception
     * @return array
     * @since 1.0.0
     */
    public function areasSortedByRegion()
    {
        if (!$this->rawAreas) {
            throw new Exception('No Areas specified for region');
        }

        foreach ($this->rawAreas as $area) {
            if (!$area['dynamic']) {
                $regions[$area['context']][$area['id']] = $area;
            }
        }
        return $regions;
    }


    /**
     * Getter to retrieve areas by context id
     * @param $id
     * @return array
     * @since 1.0.0
     */
    public function getContextAreas($id)
    {
        if (isset($this->regions[$id])) {
            return $this->regions[$id];
        } else {
            return array();
        }

    }

    /**
     * Getter for available areas
     * @return array
     * @since 1.0.0
     */
    public function getPostAreas()
    {
        return $this->postAreas;

    }

    /**
     * Getter for all areas
     * @return array
     * @since 1.0.0
     */
    public function getRawAreas()
    {
        return $this->rawAreas;

    }

    /**
     * Getter for Environment instance
     * @return PostEnvironment
     * @since 1.0.0
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
     * @since 1.0.0
     */
    public static function getDefaultContextLayout()
    {
        $defaults = array(
            'top' => array(
                'id' => 'top',
                'title' => __('Page header', 'kontentblocks'),
                'description' => __('Full width area at the top of this page', 'kontentblocks')
            ),
            'normal' => array(
                'id' => 'normal',
                'title' => __('Content', 'kontentblocks'),
                'description' => __('Main content column of this page', 'kontentblocks')
            ),
            'side' => array(
                'id' => 'side',
                'title' => __('Page Sidebar', 'kontentblocks'),
                'description' => __('Sidebar of this page', 'kontentblocks')
            ),
            'bottom' => array(
                'id' => 'bottom',
                'title' => __('Footer', 'kontentblocks'),
                'description' => __('Full width area at the bottom of this page', 'kontentblocks')
            )
        );
        // plugins may change this
        return apply_filters('kb_default_context_layout', $defaults);

    }

    /**
     * Test if sidebars are available
     * @return bool
     * @since 1.0.0
     */
    public function evaluateLayout()
    {
        return (!empty($this->regions['side']));

    }

    /**
     * Get sidebar indicator flag
     * @return bool
     */
    public function hasSidebar(){
        return $this->hasSidebar;
    }

}
