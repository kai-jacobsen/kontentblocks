<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Backend\Storage\BackupDataStorage2;


/*
 * Remove Editor from built-in Post Types, Kontentblocks will handle this instead.
 * above action will remove submit button from media upload as well
 * uses @filter get_media_item_args to readd the submit button
 */


function remove_editor_support()
{
    if (current_theme_supports( 'kontentblocks' )) {
        // hidden for pages by default
        if (apply_filters( 'kb.remove.editor.page', true )) {
            remove_post_type_support( 'page', 'editor' );
        }

        // visible for posts by default
        if (apply_filters( 'kb.remove.editor.post', false )) {
            remove_post_type_support( 'post', 'editor' );
        }
    }
}

add_action( 'init', __NAMESPACE__ . '\remove_editor_support', 12 );


/**
 * @param $postId
 */
function deleteBackup( $postId )
{
    BackupDataStorage2::deletePostCallback( $postId );
}

add_action( 'delete_post', __NAMESPACE__ . '\deleteBackup' );


/**
 * Don't render shortcodes when in concat mode to preserve shortcodes
 */
function ignoreShortcodes()
{
    remove_all_shortcodes();
}

if (isset( $_GET['concat'] )) {
    add_action( 'wp_head', __NAMESPACE__ . '\ignoreShortcodes' );
}

if (is_user_logged_in() && !is_admin()) {
    add_action(
        'kb.init',
        function () {
            new FrontendSetup();
        }
    );
};