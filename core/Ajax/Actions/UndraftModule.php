<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class UndraftModule
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\
 */
class UndraftModule implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( Request $request )
    {

        $module = $request->request->get( 'module' );
        $postId = $request->request->getInt( 'postId' );

        if (!is_int( absint( $postId ) )) {
            return new AjaxErrorResponse( 'Invalid parameters', array( 'mid' => $module, 'postId' => $postId ) );
        }

        $storage = new ModuleStorage( $postId, null );
        $module = $storage->getModuleDefinition( $module['mid'] );

        if (array_key_exists( 'state', $module )) {
            $module['state']['draft'] = !$module['state']['draft'];
        }

        $storage->addToIndex( $module['mid'], $module );
        Utilities::remoteConcatGet( $postId );

        return new AjaxSuccessResponse( 'Module published', array( 'module' => $module ) );
    }
}
