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
 * @package Kontentblocks\Ajax
 */
class ChangeModuleStatus implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $Request )
    {

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $mid = $Request->getFiltered( 'module', FILTER_SANITIZE_STRING );
        $Storage = new ModuleStorage( $postId );

        $moduleDefinition = $Storage->getModuleDefinition( $mid );
        if ($moduleDefinition) {

            // dont ask
            if ($moduleDefinition['state']['active'] != true) {
                $moduleDefinition['state']['active'] = true;
            } else {
                $moduleDefinition['state']['active'] = false;
            }

            $update = $Storage->addToIndex( $mid, $moduleDefinition );
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
