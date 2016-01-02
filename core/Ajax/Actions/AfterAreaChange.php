<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Runs after a module was dragged into a different area
 * Runs after the module view select field changed
 *
 * Gets the module options form for new/changed conditions
 *
 * Class AfterAreaChange
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class AfterAreaChange implements AjaxActionInterface
{

    static $nonce = 'kb-read';


    /**
     * Get going
     * @param ValueStorageInterface $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {

        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'Your user role does not have enough permissions for this action' );
        }


        $postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $moduleDef = $request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );

        $workshop = new ModuleWorkshop( Utilities::getPostEnvironment( $postId ), $moduleDef );
        $module = $workshop->getModule();
        $html = $module->form();
//
        $return = array(
            'html' => $html,
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON()
        );

        return new AjaxSuccessResponse( 'Area changed', $return );
    }
}
