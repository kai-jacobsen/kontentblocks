<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;

/**
 * Class ChangeModuleStatus
 * Runs when module status change
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class ChangeModuleStatus implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $request )
    {

        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $mid = $request->getFiltered( 'module', FILTER_SANITIZE_STRING );
        $storage = new ModuleStorage( $postId );

        $moduleDefinition = $storage->getModuleDefinition( $mid );
        if ($moduleDefinition) {

            // dont ask
            if ($moduleDefinition['state']['active'] != true) {
                $moduleDefinition['state']['active'] = true;
            } else {
                $moduleDefinition['state']['active'] = false;
            }

            $update = $storage->addToIndex( $mid, $moduleDefinition );
            return new AjaxSuccessResponse(
                'Status changed', array(
                    'update' => $update
                )
            );
        } else {
            return new AjaxErrorResponse(
                'Status change failed', array(
                    'moduleDef' => $moduleDefinition
                )
            );
        }
    }


}
