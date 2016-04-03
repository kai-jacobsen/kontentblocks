<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SaveStaticPanelForm
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class SaveStaticPanelForm implements AjaxActionInterface
{
    static $nonce = 'kb-update';


    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    public static function run( Request $request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $panelDef = $request->request->filter( 'panel', array(), FILTER_DEFAULT );
        $data = $request->request->filter( 'data', array(), FILTER_DEFAULT );
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
