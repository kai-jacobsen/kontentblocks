<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetModuleForm
 * retrieves the html for a modules input form
 * used for the frontend edit modal
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class GetModuleForm
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
        $module = $Request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );

        $Environment = Utilities::getEnvironment( $module['post_id'] );
        $Module = $Environment->getModuleById( $module['mid'] );
        $Module->setModuleData( $Request->getFiltered( 'moduleData', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY ) );
        $Module = apply_filters( 'kb.module.before.factory', $Module );
        $html = $Module->form();
        $return = array(
            'html' => $html,
            'json' => stripslashes_deep( Kontentblocks::getService( 'utility.jsontransport' )->getJSON() )
        );
        new AjaxSuccessResponse( 'serving module form', $return );
    }
}
