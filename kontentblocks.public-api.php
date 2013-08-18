<?php

if ( !defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

/**
 * Has to be used by each Block Class to register itself
 * 
 * @global object $Kontentblocks
 * @param string $classname 
 */
function kb_register_block( $classname )
{
    global $Kontentblocks;
    $Kontentblocks->register_block( $classname );

}

/**
 * Used to register specific per-post area settings, basically css classes to be used for a area
 * Might be handy, if you use a block for different, but similar occassions, but need slightly different styling or grid layouts
 * 
 * @global object $Kontentblocks
 * @param array $args 
 */
function kb_register_area_settings( $args )
{
    global $Kontentblocks;
    $Kontentblocks->register_area_settings( $args );

}

/**
 * Manually register area
 * 
 * Those Areas can not be deleted through the admin menu 
 */
function kb_register_area( $args )
{
    global $Kontentblocks;
    $Kontentblocks->register_area( $args );

}

/**
 * Used to register specific area templates, basically css classes to be used for a area
 * 
 * @global object $Kontentblocks
 * @param array $args
 * @param string id | unique identifier string
 * @param string label
 * @param array classes array of classes to cycle through
 * @param int last-item add class 'last-item' every nth
 */
function kb_register_area_template( $args )
{
    global $Kontentblocks;
    $Kontentblocks->register_area_template( $args );

}

function kb_register_wrapper( $area_template )
{
    global $Kontentblocks;
    $Kontentblocks->register_wrapper( $area_template );

}

/**
 * Template Tag to render a area and containing blocks
 * 
 * @global object $Kontentblocks
 * @param string $post_id
 * @param string $area 
 */
function kb_render_blocks( $id = NULL, $area = 'kontentblocks' )
{
    global $Kontentblocks, $post;
    $Kontentblocks->set_post_context( true );
    $post_id = (null === $post_id) ? $post->ID : $id;

    $Kontentblocks->render_blocks( $post_id, $area );

}

add_action( 'area', 'kb_render_area', 10, 4 );

function kb_render_area( $area = 'kontentblocks', $id = NULL, $context = null, $subcontext = null )
{
    global $Kontentblocks, $post;
    $Kontentblocks->set_post_context( true );
    $post_id = (null === $id) ? $post->ID : $id;

    $Kontentblocks->render_area( $post_id, $area, $context, $subcontext );

}

add_action( 'dynamic_area', 'kb_render_area_dynamic', 10, 4 );

function kb_render_area_dynamic( $area = null, $id = NULL, $context = null, $subcontext = null )
{
    global $Kontentblocks, $post;

    $Kontentblocks->set_post_context( false );

    $post_id = (null === $id) ? $post->ID : $id;

    $Kontentblocks->render_blocks( $post_id, $area, $context, $subcontext );

}

add_action( 'sidebar_areas', 'kb_render_area_sidebar', 10, 3 );

function kb_render_area_sidebar( $id = null, $context = null, $subcontext = 'side' )
{
    global $Kontentblocks, $post;
    $post_id = (null === $id) ? $post->ID : $id;
    $areas   = get_post_meta( $post_id, 'active_sidebar_areas', true );
    $r_areas = $Kontentblocks->get_areas();
    if ( !empty( $areas ) ) {
        foreach ( $areas as $area ) {

            if ( !isset( $r_areas[ $area ] ) )
                continue;

            $get = $r_areas[ $area ];

            $check = (empty( $get[ 'dynamic' ] )) ? $Kontentblocks->set_post_context( true ) : $Kontentblocks->set_post_context( false );
            $Kontentblocks->render_blocks( $post_id, $area, $context, $subcontext );
        }
    }

}

/**
 * Used by each Field Class to register itself
 * 
 * @global object $Kontentfields
 * @param string $id
 * @param string $class 
 */
function kb_register_field( $id, $class )
{
    global $Kontentfields;
    $Kontentfields->register_field( $id, $class );

}

;

/*
 * Get Dev Mode Status of Kontentblocks
 */

function kb_is_dev_mode()
{
    global $Kontentblocks;

    return $Kontentblocks->dev_mode;

}

/*
 * Plugin Path
 */

function kb_get_plugin_path()
{
    return trailingslashit( plugin_dir_path( __FILE__ ) ) . 'plugins/';

}

/*
 * Has modules
 */

function has_modules( $area_id, $post_id = null )
{
    global $post;
    $post_id = (null === $post_id) ? $post->ID : $post_id;

    $Meta = new KB_Post_Meta( $post_id );
    return $Meta->hasModules( $area_id );

}