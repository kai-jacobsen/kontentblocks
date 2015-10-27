<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class UndraftModule
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\
 */
class UndraftModule implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $request )
    {

        $module = $request->get( 'module' );
        $post_id = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );

        $state = filter_var( $module['state']['draft'], FILTER_VALIDATE_BOOLEAN );

        if (!is_int( absint( $post_id ) )) {
            return new AjaxErrorResponse( 'Invalid parameters', array( 'mid' => $mid, 'postId' => $post_id ) );
        }

        $storage = new ModuleStorage( $post_id, null );
        $module = $storage->getModuleDefinition( $module['mid'] );

        if (array_key_exists( 'state', $module )) {
            $module['state']['draft'] = !$module['state']['draft'];
        }

        $storage->addToIndex( $module['mid'], $module );

        return new AjaxSuccessResponse( 'Module published', array( 'module' => $module ) );
    }
}
