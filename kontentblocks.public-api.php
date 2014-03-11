<?php

use Kontentblocks\Backend\API\PostMetaAPI,
    Kontentblocks\Fields\FieldRegistry;
use Kontentblocks\Backend\Areas\AreaRegistry;

if ( !defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

/**
 * Manually register area
 *
 * Those Areas can not be deleted through the admin menu
 */
function kb_register_area( $args )
{
    $AreaRegistry = AreaRegistry::getInstance();
    $AreaRegistry->addArea($args, true);

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
    $defaults = array
    (
        'id' => '',
        'label' => '',
        'layout' => array(),
        'last-item' => false,
        'thumbnail' => null,
        'cycle' => false
    );

    $settings = wp_parse_args($args, $defaults);

    if (!empty($settings['id'])) {
        AreaRegistry::getInstance()->addTemplate($settings);
    }

}



add_action( 'area', 'kb_render_area', 10, 3 );
function kb_render_area( $area = 'kontentblocks', $id = NULL, $additionalArgs = null )
{
    global $post;
    $postId = (null === $id) ? $post->ID : $id;
    $AreaRender = new Kontentblocks\Frontend\AreaRender($postId, $area, $additionalArgs);
    $AreaRender->render(true);
}



add_action( 'sidebar_areas', 'kb_render_area_sidebar', 10, 3 );
function kb_render_area_sidebar( $id = null, $additionalArgs = array() )
{
    global  $post;
    $post_id = (null === $id) ? $post->ID : $id;
    $areas   = get_post_meta( $post_id, 'active_sidebar_areas', true );
    if ( !empty( $areas ) ) {
        foreach ( $areas as $area ) {
            $AreaRender = new Kontentblocks\Frontend\AreaRender($area, $area, $additionalArgs);
            $AreaRender->render(true);

        }
    }

}


/*
 * Plugin Path
 */

function kb_get_plugin_path()
{
    return trailingslashit( plugin_dir_path( __FILE__ ) ) . 'core/Extensions/';
}

/*
 * Has modules
 */

function has_modules( $area_id, $post_id = null )
{
    global $post;
    if ( $post === null && $post_id === null ) {
        return;
    }
    $post_id = (null === $post_id) ? $post->ID : $post_id;

    $Meta = new PostMetaAPI( $post_id );
    return $Meta->hasModules( $area_id );
}
