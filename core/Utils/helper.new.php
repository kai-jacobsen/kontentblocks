<?php

namespace Kontentblocks\Helper;

use Kontentblocks\Utils\ModuleRegistry,
    Kontentblocks\Utils\RegionRegistry;

/**
 * Render a hidden editor instance as reference
 */
function getHiddenEditor()
{
    echo "<div style='display: none;'>";
    wp_editor( '', 'content' );
    echo '</div>';

}

/**
 * Get data Handler
 */
function getDataHandler( $post_id = null )
{
    if ($post_id && $post_id !== -1){
        return new \Kontentblocks\Admin\Post\PostMetaDataHandler($post_id);
    } else {
        return new \Kontentblocks\Utils\GlobalDataHandler();
    }
}

/**
 * Echos a hidden input field with the base_id
 * Helper Function
 */
function getbaseIdField( $index )
{

    // prepare base id for new blocks
    if ( !empty( $index ) ) {
        $base_id = getHighestId( $index );
    }
    else {
        $base_id = 0;
    }
    // add a hidden field to the meta box, javascript will use this
    return '<input type="hidden" id="kb_all_blocks" value="' . $base_id . '" />';

}

/**
 * get base id for new blocks
 * extracts the attached number of every block and returns the highest number found
 *
 * @param int
 */
function getHighestId( $index )
{
    $collect = '';
    if ( !empty( $index ) ) {
        foreach ( $index as $module ) {
            $module    = maybe_unserialize( $module );
            $count     = strrchr( $module[ 'instance_id' ], "_" );
            $id        = str_replace( '_', '', $count );
            $collect[] = $id;
        }
    }
    return max( $collect );

}

function getPostTypes()
{
    $postTypes  = get_post_types( array( 'public' => true ), 'objects', 'and' );
    $collection = array();

    foreach ( $postTypes as $pt ) {
        $collect      = array(
            'name' => $pt->labels->name,
            'value' => $pt->name
        );
        $collection[] = $collect;
    }
    return $collection;

}

function getPageTemplates()
{

    $page_templates                         = get_page_templates();
    $page_templates[ 'Default (page.php)' ] = 'default';
    $collection                             = array();

    foreach ( $page_templates as $template => $filename ) {
        $collect      = array(
            'name' => $template,
            'value' => $filename
        );
        $collection[] = $collect;
    }
    return $collection;

}

function getAssignedModules( $dataContainer )
{
    $modules    = ModuleRegistry::getInstance()->getAllModules( $dataContainer );
    $collection = array();

    foreach ( $modules as $module ) {
        if ( isset( $module->settings[ 'in_dynamic' ] ) && $module->settings[ 'in_dynamic' ] === true ) {
            $collect      = array(
                'name' => $module->settings[ 'public_name' ],
                'value' => get_class( $module )
            );
            $collection[] = $collect;
        }
    }
    return $collection;

}

function getAreaTemplates()
{
    $templates  = RegionRegistry::getInstance()->getTemplates();
    $collection = array();

    foreach ( $templates as $tpl ) {
        $collect      = array(
            'name' => $tpl[ 'label' ],
            'value' => $tpl[ 'id' ]
        );
        $collection[] = $collect;
    }
    return $collection;

}

function underscoreit( $val )
{
    if ( !is_string( $val ) ) {
        return $val;
    }
    else {
        return '_' . $val;
    }

}
