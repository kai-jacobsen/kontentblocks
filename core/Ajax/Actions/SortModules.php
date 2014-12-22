<?php

namespace Kontentblocks\Actions\Ajax;

use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\DataInputInterface;
use Kontentblocks\Utils\RequestWrapper;

/**
 * Class SortModules
 * @package Kontentblocks\Ajax
 */
class SortModules
{

    public static function run( DataInputInterface $Request )
    {

        $data = $Request->getFiltered( 'data', FILTER_REQUIRE_ARRAY );
        // bail if essentials are missing
        if (!isset( $data ) || !is_array( $data )) {
            wp_send_json_error( 'No valid data sent' );
        }

        // setup properties
        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $Storage = new ModuleStorage( $postId );
        $old = $Storage->getIndex();
        wp_send_json($postId);
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
        }
        $save = array_merge( $old, $new );
        $update = $Storage->saveIndex( $save );
        if ($update) {
            wp_send_json( $update );
        } else {
            wp_send_json_error();
        }
    }


}
