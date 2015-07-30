<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class UndraftModule
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class UndraftModule implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $request )
    {

        $mid = $request->getFiltered( 'mid', FILTER_SANITIZE_STRING );
        $post_id = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );

        if (empty( $mid ) || !is_int( absint( $post_id ) )) {
            return new AjaxErrorResponse( 'Invalid parameters', array( 'mid' => $mid, 'postId' => $post_id ) );
        }

        $storage = new ModuleStorage( $post_id, null );
        $module = $storage->getModuleDefinition( $mid );

        if (array_key_exists( 'state', $module )) {
            $module['state']['draft'] = false;
        }

        $storage->addToIndex( $mid, $module );

        return new AjaxSuccessResponse( 'Module published', array( 'module' => $module ) );
    }
}
