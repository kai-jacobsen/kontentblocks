<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\DataProvider\SerOptionsDataProvider;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class SaveOptionPanelForm
 * retrieves the html for a panels form
 * used for the frontend edit modal
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax\Frontend
 */
class SaveOptionPanelForm implements AjaxActionInterface
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
        $id = $panel['baseId'];
        $panelData = wp_unslash($data[$id]);

        $Panel = \Kontentblocks\getPanel($id);
        $old = $Panel->getData();
        $new = $Panel->fields($Panel->FieldController)->save($panelData, $old);

        $merged = Utilities::arrayMergeRecursive( $new, $old );
        $Panel->DataProvider->set($merged)->save();

        $return = array(
            'newData' => $Panel->DataProvider->export()
        );
        new AjaxSuccessResponse( 'options data saved', $return );
    }
}
