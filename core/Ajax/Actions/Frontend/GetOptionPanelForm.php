<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetOptionPanelForm
 * retrieves the html for a panels form
 * used for the frontend edit modal
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class GetOptionPanelForm implements AjaxActionInterface
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
        $id = $panel['baseId'];

        $Panel = \Kontentblocks\getPanel( $id );
        $Panel->setData( wp_unslash($panel['moduleData']) );
        $return = array(
            'html' => $Panel->renderFields(),
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );
        new AjaxSuccessResponse( 'serving module form', $return );
    }
}
