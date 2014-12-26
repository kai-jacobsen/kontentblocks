<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class FieldGetImage
 * @package Kontentblocks\Ajax\Frontend
 */
class UndraftModule
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $Request )
    {

        $mid = $Request->getFiltered( 'mid', FILTER_SANITIZE_STRING );
        $post_id = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );

        if (empty( $mid ) || !is_int( absint( $post_id ) )) {
            return new AjaxErrorResponse( 'Invalid parameters', array( 'mid' => $mid, 'post_id' => $post_id ) );
        }

        $Storage = new ModuleStorage( $post_id, null );
        $module = $Storage->getModuleDefinition( $mid );

        if (array_key_exists( 'state', $module )) {
            $module['state']['draft'] = false;
        }

        $Storage->addToIndex( $mid, $module );

        return new AjaxSuccessResponse( 'Module published', array( 'module' => $module ) );
    }
}
