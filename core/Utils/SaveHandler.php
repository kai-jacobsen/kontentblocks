<?php

namespace Kontentblocks\Utils;

class SaveHandler
{

    public static function authPost($post_id, $post_object)
    {
        if ( empty( $_POST ) ) {
            return false;
        }

        if ( empty( $_POST[ 'kb_noncename' ] ) ) {
            return false;
        }

        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if ( !empty( $_POST ) ) {
            if ( !wp_verify_nonce( $_POST[ 'kb_noncename' ], plugin_basename( __FILE__ ) ) ) {
                return false;
            }
        }

        // Check permissions
        if ( 'page' == $_POST[ 'post_type' ] ) {
            if ( !current_user_can( 'edit_page', $post_id ) ) {
                return false;
            }
        }
        else {
            if ( !current_user_can( 'edit_post', $post_id ) ) {

                return false;
            }
        }

        if ( !current_user_can( 'edit_kontentblocks' ) ) {
            return false;
        }

        if ( $post_object->post_type == 'revision' && !isset( $_POST[ 'wp-preview' ] ) ) {
            return false;
        }

        return isset( $_POST[ 'post_ID' ] ) ? $_POST[ 'post_ID' ] : NULL;
    }

    public static function authGlobal()
    {

    }

    public static function save()
    {

    }


    public static function saveIndividualData()
    {

    }
}