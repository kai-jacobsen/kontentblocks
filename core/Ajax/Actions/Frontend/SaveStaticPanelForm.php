<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\DataProvider\SerOptionsDataProvider;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class SaveStaticPanelForm
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class SaveStaticPanelForm implements AjaxActionInterface
{
    static $nonce = 'kb-update';


    /**
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $panelDef = $request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $data = $request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $panId = filter_var( $panelDef['baseId'], FILTER_SANITIZE_STRING );
        $postId = filter_var($panelDef['postId'], FILTER_SANITIZE_NUMBER_INT);
        $panelData = wp_unslash( $data );

        $panel = \Kontentblocks\getPostPanel( $panId, $postId );
        $old = $panel->model->export();
        $new = $panel->fields->save( $panelData, $old );

        $merged = Utilities::arrayMergeRecursive( $new, $old );
        update_post_meta( $postId, $panId, $merged );
        $return = array(
            'newData' => $merged
        );
        return new AjaxSuccessResponse( 'options data saved', $return );
    }
}
