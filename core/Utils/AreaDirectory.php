<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Admin\PostDataContainer;

class AreaDirectory
{

    protected $rawAreas  = array();
    protected $templates = array();
    static $instance;

    public function getInstance()
    {
        if ( null == self::$instance ) {
            self::$instance = new self;
            self::$instance->init();
        }

        return self::$instance;

    }

    public function init()
    {
        $storedAreas = get_option( 'kb_registered_areas' );
        if ( !empty( $storedAreas ) ) {
            foreach ( $storedAreas as $area ) {
                $this->addArea( $area, false );
            }
        }

    }

    public function addArea( $args, $manual = true )
    {
        if ( !empty( $args[ 'id' ] ) ) {
            $args[ 'id' ] = sanitize_title( $args[ 'id' ] );
        }

        // merge defaults with provided args
        $area = wp_parse_args( $args, $this->_getDefaults($manual) );

        if ( empty( $this->rawAreas[ $area[ 'id' ] ] ) ) {
            $this->rawAreas[ $area[ 'id' ] ] = $area;
        }
        else {
            $this->rawAreas[ $area[ 'id' ] ] = wp_parse_args( $this->rawAreas[ $area[ 'id' ] ], $area );
        }

    }

    public function saveArea( $id, $args )
    {
        $storedAreas = get_option( 'kb_registered_areas' );

        $storedAreas[ $id ] = $args;
        return update_option( 'kb_registered_areas', $storedAreas );

    }

    public function getArea( $id )
    {
        if ( isset( $this->rawAreas[ $id ] ) ) {
            return $this->rawAreas[ $id ];
        }
        else {
            return null;
        }

    }

    public function getGlobalAreas( $context = null )
    {
        $collection = array();
        foreach ( $this->rawAreas as $area ) {
            if ( $area[ 'dynamic' ] === true ) {
                $collection[] = $area;
            }
        }
        return $collection;

    }

    public function getTemplates()
    {
        return $this->templates;

    }

    public function addTemplate( $args )
    {
        if ( !empty( $args[ 'id' ] ) ) {
            $this->templates[ $args[ 'id' ] ] = $args;
        }

    }

    public function connect( $classname, $args )
    {
        if ( !empty( $args[ 'connect' ] ) && $args[ 'connect' ] === 'any' ) {

            foreach ( $this->rawAreas as $area_id => $area ) {
                if ( !in_array( $classname, $area[ 'available_blocks' ] ) ) {
                    $this->rawAreas[ $area_id ][ 'available_blocks' ][] = $classname;
                }
            }
        }
        else if ( !empty( $args[ 'connect' ] ) and is_array( $args[ 'connect' ] ) ) {
            $update = false;


            foreach ( $args[ 'connect' ] as $area_id ) {
                if ( empty( $this->rawAreas[ $area_id ] ) ) {
                    continue;
                }

                $area = $this->rawAreas[ $area_id ];

                if ( !in_array( $classname, $area[ 'available_blocks' ] ) ) {
                    $area[ 'available_blocks' ][] = $classname;
                }
                $this->rawAreas[ $area_id ] = $area;
                $update                     = true;
            }
        }

    }

    public function filterForPost( PostDataContainer $postData )
    {

        $pageTemplate = $postData->get( 'pageTemplate' );
        $postType     = $postData->get( 'postType' );

        // bail out if this is a redirect template
        if ( false !== strpos( $pageTemplate, 'redirect' ) ) {
            return false;
        }

        //declare var
        $areas = array();

        // loop through areas and find all which are attached to this post type and/or page template
        foreach ( $this->rawAreas as $area ) {

            if ( empty( $area[ 'context' ] ) ) {
                $area[ 'context' ] = 'side';
            }

            if ( (!empty( $area[ 'page_template' ] ) ) && (!empty( $area[ 'post_type' ] )) ) {
                if ( in_array( $pageTemplate, $area[ 'page_template' ] ) && in_array( $postType, $area[ 'post_type' ] ) ) {
                    $areas[] = $area;
                }
            }
            elseif ( !empty( $area[ 'page_template' ] ) ) {
                if ( in_array( $pageTemplate, $area[ 'page_template' ] ) ) {
                    $areas[] = $area;
                }
            }
            elseif ( !empty( $area[ 'post_type' ] ) ) {
                if ( in_array( $postType, $area[ 'post_type' ] ) ) {
                    $areas[] = $area;
                }
            }
        }

        $sareas = self::orderBy( $areas, 'order' );

        return $sareas;

    }

    private function orderBy( $areas, $field )
    {
        $code = "return strnatcmp(\$a['$field'], \$b['$field']);";
        usort( $areas, create_function( '$a,$b', $code ) );
        return $areas;

    }

    private function _getDefaults( $manual = true )
    {
        return array(
            'id' => '', // unique id of area
            'name' => '', // public shown name
            'description' => '', // public description
            'before_area' => '<div id="%s" class="kb_area %s">', //default wrapper markup
            'after_area' => '</div>',
            'post_type' => array(), // array of post types where this area is available to
            'page_template' => array(), // array of page template names where this area is available to
            'available_blocks' => array(), // array of classnames
            'area_templates' => array(), // array of area template ids
            'dynamic' => false, // whether this is an dynamic area
            'manual' => $manual, // true if set by code
            'block_limit' => '0', // how many blocks are allowed
            'order' => 0, // order index for sorting
            'dev_mode' => false, // deprecated
            'context' => 'normal', // where on the edit screen
            'belongs_to' => __( 'Pages', 'kontentblocks' ) // internal identification, sorting helper
        );

    }

}
