<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Utils\RequestWrapper;

/**
 * Class SortModules
 * @package Kontentblocks\Ajax
 */
class SortModules implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $Request )
    {

        $data = $Request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        // bail if essentials are missing
        if (!isset( $data ) || !is_array( $data )) {
            return new AjaxErrorResponse( 'No valid data sent', $data );
        }

        // setup properties
        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $Storage = new ModuleStorage( $postId );
        $old = $Storage->getIndex();

        // action
        $new = array();
        foreach ($data as $area => $string) {
            parse_str( $string, $result );
            foreach ($result as $k => $v) {
                foreach ($old as $id => $module) {
                    if ($id === $k) {
                        unset( $old[$k] );
                    }
                    if ($module['area'] === $area && $module['instance_id'] === $k):
                        $new[$module['instance_id']] = $module;
                    endif;
                }
            }
        };
        $save = array_merge( $old, $new );
        $update = $Storage->saveIndex( $save );
        if ($update || count( $Storage ) > 1) {
            return new AjaxSuccessResponse( 'Modules successfully resorted', $save );
        } else {
            return new AjaxErrorResponse( ' Resorting failed', array( 'updateMsg' => $update ) );
        }
    }


}
