<?php

namespace Kontentblocks;

use Kontentblocks\Backend\Screen\Layouts\EditScreenLayoutsRegistry;
use Kontentblocks\Frontend\Renderer\AreaRenderer;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Utils\JSONTransport;
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
 * @param string $areaId
 * @param int $post_id
 * @param array $additionalArgs
 * @return string|void
 */
function renderSingleArea( $areaId, $post_id = null, $additionalArgs = array() )
{
    global $post;
    $postId = ( is_null( $post_id ) && !is_null( $post ) ) ? $post->ID : $post_id;


    if (is_null( $postId )) {
        return null;
    }


    /** @var \Kontentblocks\Areas\AreaRegistry $registry */
    $registry = Kontentblocks::getService( 'registry.areas' );
    if ($registry->isDynamic( $areaId )) {
        $areaDef = $registry->getArea( $areaId );
        $environment = Utilities::getEnvironment( $areaDef->parent_id, $postId );
    } else {
        $environment = Utilities::getEnvironment( $postId );
    }

    $area = $environment->getAreaDefinition( $areaId );


    if (!$area) {
        return '';
    }

    $areaRenderSettings = new AreaRenderSettings( $additionalArgs, $area );
    if (is_a( $areaRenderSettings->view, '\Kontentblocks\Frontend\Renderer\AreaFileRenderer', true )) {
        $renderer = new $areaRenderSettings->view( $environment, $areaRenderSettings );
    } else {
        $renderer = new AreaRenderer( $environment, $areaRenderSettings );
    }

    $renderer->render( true );
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


function renderContext( $context, $post_id, $additionalArgs = array() )
{
    global $post;
    $postId = ( null === $post_id ) ? $post->ID : $post_id;

    $Environment = Utilities::getEnvironment( $postId );
    $areas = $Environment->getAreasForContext( $context );
    $contextsOrder = $Environment->getDataProvider()->get( 'kb.contexts' );

    if (is_array( $contextsOrder ) && !empty( $contextsOrder )) {
        foreach ($contextsOrder as $context => $areaIds) {
            if (is_array( $areaIds )) {
                foreach (array_keys( $areaIds ) as $areaId) {
                    if (isset( $areas[$areaId] )) {
                        $tmp = $areas[$areaId];
                        unset( $areas[$areaId] );
                        $areas[$areaId] = $tmp;
                    }
                }
            }
        }
    }

    if (!empty( $areas )) {
        foreach (array_keys( $areas ) as $area) {
            $args = array();
            if (array_key_exists( $area, $additionalArgs )) {
                $args = Utilities::arrayMergeRecursive( $additionalArgs[$area], $additionalArgs );
            } else {
                $args = $additionalArgs;
            }

            renderSingleArea( $area, $postId, $additionalArgs );
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

    $Environment = Utilities::getEnvironment( $id );
    $areas = $Environment->getModulesForArea( $area );

    return !empty( $areas );
}


/**
 * @param null $id
 * @param null $post_id
 * @return Panels\OptionsPanel|null|\WP_Error
 */
function getPanel( $id = null, $post_id = null )
{
    return getPostPanel( $id, $post_id );
}

function getPostPanel( $panelId = null, $postId = null )
{

    if (is_null( $postId )) {
        $postId = get_the_ID();
    }
    $Environment = Utilities::getEnvironment( $postId );

    $Panel = $Environment->getPanelObject( $panelId );
    /** @var \Kontentblocks\Panels\PostPanel $Panel */
    if (is_a( $Panel, "\\Kontentblocks\\Panels\\AbstractPanel" )) {
        return $Panel;
    } else {
        return new \WP_Error(
            'Kontentblocks',
            'Panel with requested id does not exist.',
            array( 'request' => $panelId, 'line' => __LINE__, 'file' => __FILE__ )
        );
    }
}

/**
 * @param null $panelId
 * @param null $postId
 * @return mixed
 */
function getPostPanelModel( $panelId = null, $postId = null )
{
    $panel = getPostPanel($panelId, $postId);
    if (is_a($panel, '\Kontentblocks\Panels\PostPanel')){
        return $panel->setupFrontendData();
    }
}


/**
 * @param $panelId
 * @return mixed
 */
function getOptionsPanel( $panelId )
{
    /** @var \Kontentblocks\Panels\PanelRegistry $registry */
    $registry = Kontentblocks()->getService( 'registry.panels' );
    $panel = $registry->get( $panelId );
    if (!empty( $panel ) && class_exists( $panel['class'] )) {
        return new $panel['class']( $panel );
    }
}

function getOptionsPanelModel( $panelId )
{
    $panel = getOptionsPanel( $panelId );
    if (is_a( $panel, '\Kontentblocks\Panels\OptionsPanel' )) {
        return $panel->setupFrontendData();
    }
}

/**
 * @return EditScreenLayoutsRegistry
 */
function EditScreenLayoutsRegistry()
{
    return Kontentblocks()->getService( 'registry.screenLayouts' );
}

/**
 * @return JSONTransport
 */
function JSONTransport()
{
    return Kontentblocks()->getService( 'utility.jsontransport' );
}