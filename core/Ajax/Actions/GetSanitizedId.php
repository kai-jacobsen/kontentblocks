<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;


/**
 * Class GetSanitizedId
 * Runs when a dynamic area or a template gets created
 * checks if an id already exists
 *
 * @package Kontentblocks\Ajax
 */
class GetSanitizedId
{

    static $nonce = 'kb-read';

    public static function run( ValueStorageInterface $Request )
    {
        // verify action
        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        $value = $Request->getFiltered( 'inputvalue', FILTER_SANITIZE_STRING );
        $checkmode = $Request->getFiltered( 'checkmode', FILTER_SANITIZE_STRING );
        $check = false;

        switch ($checkmode) {
            case 'areas':
                $check = self::checkAreaExists( trim( $value ) );
                break;
            case 'templates':
                $check = self::checkTemplateExists( trim( $value ) );
                break;
        }

        if (is_string( $check )) {
            return new AjaxSuccessResponse(
                'ID is valid', array(
                    'id' => $check
                )
            );
        } else {
            return new AjaxErrorResponse( 'ID already esists' );
        }

    }

    /**
     * @param $ad
     *
     * @return mixed|string
     */
    private static function checkAreaExists( $ad )
    {
        $sane = sanitize_title( 'kb_da_' . $ad );
        $sane = str_replace( '-', '_', $sane );
        $posts = get_posts(
            array(
                'post_type' => 'kb-dyar',
                'posts_per_page' => 1,
                'name' => $sane,
                'suppress_filters' => false
            )
        );

        if (!empty( $posts )) {
            return false;
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
        $sane = sanitize_title( 'kb_tpl_' . $ad );
        $sane = str_replace( '-', '_', $sane );

        $posts = get_posts(
            array(
                'post_type' => 'kb-mdtpl',
                'posts_per_page' => 1,
                'name' => $sane,
                'suppress_filters' => false,
                'post_status' => array(
                    'publish',
                    'pending',
                    'draft',
                    'auto-draft',
                    'future',
                    'private',
                    'inherit',
                    'trash'
                )
            )
        );
        if (!empty( $posts )) {
            return false;
        }
        return str_replace( '-', '_', $sane );

    }

}
