<?php

use Kontentblocks\Kontentblocks;

/**
 * Collection of namespace-less wp template functions wrapper to
 * Kontentblocks functions
 */

/**
 * Register Area wrapper
 * @param $args
 */
function kb_register_area( $args )
{
    \Kontentblocks\registerArea( $args );
}


/**
 * Register area template wrapper
 * @param array $args
 */
function kb_register_area_template( $args )
{
    \Kontentblocks\registerAreaTemplate( $args );
}


/**
 * Render a single area wrapper
 * @param null $area
 * @param null $post_id
 * @param null $additionalArgs
 */
function kb_render_area( $area = null, $post_id = null, $additionalArgs = null )
{
    \Kontentblocks\renderSingleArea( $area, $post_id, $additionalArgs );
}

add_action( 'kb_area', 'kb_render_area', 10, 3 );
add_action( 'area', 'kb_render_area', 10, 3 );


/**
 * Render a single context
 * @param null $context
 * @param null $post_id
 * @param array|null $additionalArgs
 */
function kb_render_context( $context = null, $post_id = null, $additionalArgs = array() )
{
    \Kontentblocks\renderContext( $context, $post_id, $additionalArgs );
}

add_action( 'kb_context', 'kb_render_context', 10, 3 );


/**
 * Render attached sidebar areas wrapper
 * @param null $id
 * @param array $additionalArgs
 */
function kb_render_area_sidebar( $id = null, $additionalArgs = array() )
{
    \Kontentblocks\renderSideAreas( $id, $additionalArgs );
}

add_action( 'sidebar_areas', 'kb_render_area_sidebar', 10, 3 );


/**
 * Has modules check wrapper
 * @param $area_id
 * @param null $post_id
 */
function has_modules( $area_id, $post_id = null )
{
    \Kontentblocks\hasModules( $area_id, $post_id );
}

/**
 * @return Kontentblocks static
 */
function Kontentblocks()
{
    return Kontentblocks::getInstance();
}