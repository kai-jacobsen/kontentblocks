<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Backend\Storage\BackupDataStorage;



/*
 * Remove Editor from built-in Post Types, Kontentblocks will handle this instead.
 * above action will remove submit button from media upload as well
 * uses @filter get_media_item_args to readd the submit button
 */


function remove_editor_support()
{
    if (current_theme_supports('kontentblocks')){
        // hidden for pages by default
        if (apply_filters( 'kb_remove_editor_page', true )) {
            remove_post_type_support( 'page', 'editor' );
        }

        // visible for posts by default
        if (apply_filters( 'kb_remove_editor_post', false )) {
            remove_post_type_support( 'post', 'editor' );
        }
    }
}

add_action( 'init', __NAMESPACE__ . '\remove_editor_support', 12 );


/**
 * @param $post_id
 */
function deleteBackup( $post_id )
{
    BackupDataStorage::deletePostCallback( $post_id );
}

add_action( 'delete_post', __NAMESPACE__ . '\deleteBackup' );
