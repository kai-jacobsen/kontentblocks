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
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $panelDef = $request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $baseId = $panelDef['baseId'];

        $panel = \Kontentblocks\getPanel( $baseId );
        $pdata = (!empty($panelDef['entityData'])) ? wp_unslash($panelDef['entityData']) : [];
        $panel->setData( $pdata );
        $return = array(
            'html' => $panel->renderFields(),
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );
        new AjaxSuccessResponse( 'serving module form', $return );
    }
}
