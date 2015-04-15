<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetStaticPanelForm
 * retrieves the html for a panels form
 * used for the frontend edit modal
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class GetStaticPanelForm implements AjaxActionInterface
{
    static $nonce = 'kb-read';


    /**
     * @param ValueStorageInterface $Request
     */
    public static function run( ValueStorageInterface $Request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $panel = $Request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $panId = filter_var( $panel['baseId'], FILTER_SANITIZE_STRING );
        $postId = filter_var( $panel['postId'], FILTER_SANITIZE_NUMBER_INT );

        $Panel = \Kontentblocks\getPanel( $panId, $postId );
        $pdata = ( !empty( $panel['moduleData'] ) ) ? wp_unslash( $panel['moduleData'] ) : [ ];
        $Panel->setData( $pdata );
        $return = array(
            'html' => $Panel->renderFields(),
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );
        new AjaxSuccessResponse( 'serving module form', $return );
    }
}
