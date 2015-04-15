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
     * @param ValueStorageInterface $Request
     */
    public static function run( ValueStorageInterface $Request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $panel = $Request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $data = $Request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $panId = filter_var( $panel['baseId'], FILTER_SANITIZE_STRING );
        $postId = filter_var($panel['postId'], FILTER_SANITIZE_NUMBER_INT);
        $panelData = wp_unslash( $data[$panId] );

        $Panel = \Kontentblocks\getPanel( $panId, $postId );
        $old = $Panel->getData();
        $new = $Panel->fields( $Panel->FieldController )->save( $panelData, $old );

        $merged = Utilities::arrayMergeRecursive( $new, $old );
        update_post_meta( $postId, $panId, $merged );
        $return = array(
            'newData' => $merged
        );
        new AjaxSuccessResponse( 'options data saved', $return );
    }
}
