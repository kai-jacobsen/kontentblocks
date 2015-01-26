<?php

namespace Kontentblocks\Ajax\Actions;

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
 *
 *
 * Class AfterAreaChange
 * @package Kontentblocks\Ajax
 */
class AfterAreaChange
{

    static $nonce = 'kb-read';


    /**
     * Get going
     * @param ValueStorageInterface $Request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {

        if (!current_user_can( 'edit_kontentblocks' )) {
            return new AjaxErrorResponse( 'Your user role does not have enough permissions for this action' );
        }

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $module = $Request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );


        $Workshop = new ModuleWorkshop(Utilities::getEnvironment($postId),$module);
        $Module = $Workshop->getModule();
        $html = $Module->form();
        $return = array(
            'html' => stripslashes_deep( $html ),
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );

        // @TODO handle empty options meaningful
//        if ( empty( $html ) ) {
//            wp_send_json( \Kontentblocks\Helper\noOptionsMessage() );
//        }
        return new AjaxSuccessResponse( 'Area changed', $return );
    }
}
