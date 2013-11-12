<?php

namespace Kontentblocks\Admin\Post;

use Kontentblocks\Admin\Post\PostEnvironment,
    Kontentblocks\Admin\Post\ScreenContext;

class ScreenManager
{

    /**
     * Raw areas are all areas which are available in the current context
     * e.g. are assigned to pagetemplate and/or post type
     * @var array 
     */
    protected $rawAreas;

    /**
     * TODO: What is this?
     * @var array 
     */
    protected $postAreas;

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

    public function __construct( PostEnvironment $postData )
    {

        // get areas available
        if ( empty( $postData->get( 'areas' ) ) ) {
            return false;
        }

        $this->postData      = $postData;
        $this->regionLayout = $this->_getDefaultRegionLayout();
        $this->rawAreas      = $postData->get( 'areas' );
        $this->regions      = $this->areasSortedByRegion( $this->rawAreas );
        // test if final context layout includes an sidebar
        // e.g. if an area is assigned to 'side'
        $this->hasSidebar = $this->evaluateLayout();

    }

    /*
     * Main Render function
     */

    public function render()
    {
        foreach ( $this->regionLayout as $contextId => $args ) {

            // delegate the actual output to ScreenContext
            $context = new ScreenContext( $args, $this );
            $context->render();
        }

    }

    /**
     * Sort raw Area definitions to array
     * @return array
     */
    public function areasSortedByRegion()
    {
        if ( !$this->rawAreas ) {
            throw new Exception( 'No Areas specified for region' );
        }

        foreach ( $this->rawAreas as $area ) {
            $regions[ $area[ 'context' ] ][ $area[ 'id' ] ] = $area;
        }
        return $regions;

    }

    
    public function getRegionAreas( $id )
    {
        if ( isset( $this->regions[ $id ] ) ) {
            return $this->regions[ $id ];
        }
        else {
            return array();
        }

    }

    /*
     * Default Context Layout
     * 
     * @return array default context layout
     * @filter kb_default_context_layout
     */

    public function _getDefaultRegionLayout()
    {
        $defaults = array(
            'top' => array(
                'id' => 'top',
                'title' => __( 'Page header', 'kontentblocks' ),
                'description' => __( 'Full width area at the top of this page', 'kontentblocks' )
            ),
            'normal' => array(
                'id' => 'normal',
                'title' => __( 'Content', 'kontentblocks' ),
                'description' => __( 'Main content column of this page', 'kontentblocks' )
            ),
            'side' => array(
                'id' => 'side',
                'title' => __( 'Page Sidebar', 'kontentblocks' ),
                'description' => __( 'Sidebar of this page', 'kontentblocks' )
            ),
            'bottom' => array(
                'id' => 'bottom',
                'title' => __( 'Footer', 'kontentblocks' ),
                'description' => __( 'Full width area at the bottom of this page', 'kontentblocks' )
            )
        );
        // plugins may change this
        return apply_filters( 'kb_default_context_layout', $defaults );

    }

    public function evaluateLayout()
    {
        return (!empty( $this->regions[ 'side' ] )) ? true : false;

    }

    public function getPostAreas()
    {
        return $this->postAreas;

    }

}
