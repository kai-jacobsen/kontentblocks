<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Backend\Storage\BackupDataStorage;


// enabled for 'page' by default
add_post_type_support( 'page', 'kontentblocks' );
remove_post_type_support( 'page', 'revisions' );


/*
 * Remove Editor from built-in Post Types, Kontentblocks will handle this instead.
 * above action will remove submit button from media upload as well
 * uses @filter get_media_item_args to readd the submit button
 */

function remove_editor_support()
{
    // hidden for pages by default
    if (apply_filters( 'kb_remove_editor_page', true )) {
        remove_post_type_support( 'page', 'editor' );
    }

    // visible for posts by default
    if (apply_filters( 'kb_remove_editor_post', false )) {
        remove_post_type_support( 'post', 'editor' );
    }

}

add_action( 'init', __NAMESPACE__ . '\remove_editor_support' );


/**
 * @param $post_id
 */
function deleteBaxckup( $post_id )
{
    BackupDataStorage::deletePostCallback( $post_id );
}

add_action( 'delete_post', __NAMESPACE__ . '\deleteBackup' );
