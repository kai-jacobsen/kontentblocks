<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;


/**
 * Class GetSanitizedId
 * Runs when a dynamic area or a template gets created
 * checks if an id already exists
 *
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class GetSanitizedId implements AjaxActionInterface
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
                $check = self::checkExistence( trim( $value ), 'kb-dyar', 'kb_da_' );
                break;
            case 'gmodules':
                $check = self::checkExistence( trim( $value ), 'kb-mdtpl', 'kb_gm_' );
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
     * @param string $input
     * @param string $postType
     * @param string $prefix
     * @return bool|mixed|string
     */
    private static function checkExistence( $input, $postType, $prefix )
    {
        global $wpdb;
        $sane = sanitize_title( $prefix . $input );
        $sane = str_replace( '-', '_', $sane );

        $posts = $wpdb->get_results(
            "SELECT * FROM $wpdb->posts WHERE post_type = '$postType' AND post_name = '$sane' LIMIT 1"
        );

        if (!empty( $posts )) {
            return false;
        }
        return $sane;
    }

}
