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
 * @param null $id
 * @param null $additionalArgs
 */
function kb_render_area( $area = null, $id = null, $additionalArgs = null )
{
    \Kontentblocks\renderSingleArea( $area, $id, $additionalArgs );
}

add_action( 'area', 'kb_render_area', 10, 3 );


/**
 * Render a single context
 * @param null $area
 * @param null $id
 * @param null $additionalArgs
 */
function kb_render_context( $context = null, $id = null, $additionalArgs = null )
{
    \Kontentblocks\renderContext( $context, $id, $additionalArgs );
}

add_action( 'context', 'kb_render_context', 10, 3 );


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