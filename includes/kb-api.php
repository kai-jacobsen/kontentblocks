<?php

namespace Kontentblocks;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Frontend\AreaRenderer;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Register Area
 * @param $args
 */
function registerArea( $args )
{
    /** @var \Kontentblocks\Areas\AreaRegistry $AreaRegistry */
    $AreaRegistry = Kontentblocks::getService( 'registry.areas' );
    $AreaRegistry->addArea( $args, true );

}

/**
 * Register Area template
 * @param $args
 */
function registerAreaTemplate( $args )
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

    $settings = wp_parse_args( $args, $defaults );

    if (!empty( $settings['id'] )) {
        Kontentblocks::getService( 'registry.areas' )->addTemplate( $settings );
    }

}


/**
 * Render a single area by id
 * @param string $area
 * @param int $id
 * @param array $additionalArgs
 */
function renderSingleArea( $area, $id = null, $additionalArgs )
{
    global $post;
    $postId = ( is_null( $id ) ) ? $post->ID : $id;

    /** @var \Kontentblocks\Areas\AreaRegistry $Registry */
    $Registry = Kontentblocks::getService( 'registry.areas' );
    if ($Registry->isDynamic( $area )) {
        $areaDef = $Registry->getArea( $area );
        $Environment = Utilities::getEnvironment( $areaDef->parent_id, $postId );
    } else {
        $Environment = Utilities::getEnvironment( $postId );

    }

    $AreaRender = new AreaRenderer( $Environment, $area, $additionalArgs );
    $AreaRender->render( true );
}


/**
 * Render attached side(bar) areas
 * @param int $id
 * @param array $additionalArgs
 */
function renderSideAreas( $id, $additionalArgs )
{
    global $post;

    $post_id = ( null === $id ) ? $post->ID : $id;
    $areas = get_post_meta( $post_id, 'active_sidebar_areas', true );
    if (!empty( $areas )) {
        foreach ($areas as $area) {
            renderSingleArea( $area, $post_id, $additionalArgs );
        }
    }
}


/**
 * Test if an area has modules attached
 * @param string $area
 * @param int $id
 * @return mixed
 */
function hasModules( $area, $id )
{
    global $post;
    if ($post === null && $id === null) {
        return false;
    }
    $post_id = ( null === $id ) ? $post->ID : $id;

    $Meta = new ModuleStorage( $post_id );
    return $Meta->hasModules( $area );
}


function getPanel( $id = null )
{
    /** @var \Kontentblocks\Panels\PanelRegistry $Registry */
    $Registry = Kontentblocks::getService( 'registry.panels' );
    /** @var \Kontentblocks\Panels\OptionsPanel $Panel */
    $Panel = $Registry->get( $id );
    if (is_a( $Panel, "\\Kontentblocks\\Panels\\AbstractPanel" )) {
        return $Panel->setup();
    } else {
        return new \WP_Error(
            'Kontentblocks',
            'Panel with requested id does not exist.',
            array( 'request' => $id, 'line' => __LINE__, 'file' => __FILE__ )
        );
    }
}
