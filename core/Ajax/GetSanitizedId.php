<?php

namespace Kontentblocks\Ajax;


/**
 * Class GetSanitizedId
 * Runs when a dynamic area or a template gets created
 * checks if an id already exists
 *
 * @package Kontentblocks\Ajax
 */
class GetSanitizedId
{

    public static function run()
    {

        // verify action
        check_ajax_referer( 'kb-read' );
        if (!current_user_can( 'edit_kontentblocks' )) {
            wp_send_json_error();
        }

        $value     = filter_var( $_POST['inputvalue'], FILTER_SANITIZE_STRING );
        $checkmode = filter_var( $_POST['checkmode'], FILTER_SANITIZE_STRING );
        $check     = true;

        switch ($checkmode) {
            case 'areas':
                $check = self::checkAreaExists( trim( $value ) );
                break;
            case 'templates':
                $check = self::checkTemplateExists( trim( $value ) );
                break;
        }

        wp_send_json( $check );

    }

    /**
     * @param $ad
     *
     * @return mixed|string
     */
    private static function checkAreaExists( $ad )
    {
        $sane = sanitize_title( $ad );

        $posts = get_posts(
            array(
                'post_type'        => 'kb-dyar',
                'posts_per_page'   => 1,
                'name'             => $sane,
                'suppress_filters' => false
            )
        );

        if (!empty( $posts )) {
            return 'translate';
        }

        return str_replace( '-', '_', $sane );

    }

    /**
     * @param $ad
     *
     * @return mixed|string
     */
    private static function checkTemplateExists( $ad )
    {
        $sane = sanitize_title( $ad );

        $posts = get_posts(
            array(
                'post_type'        => 'kb-mdtpl',
                'posts_per_page'   => 1,
                'name'             => $sane,
                'suppress_filters' => false,
                'post_status' => array('publish', 'pending', 'draft', 'auto-draft', 'future', 'private', 'inherit', 'trash')
            )
        );
        if (!empty( $posts )) {
            return 'translate';
        }

        return str_replace( '-', '_', $sane );

    }

}
