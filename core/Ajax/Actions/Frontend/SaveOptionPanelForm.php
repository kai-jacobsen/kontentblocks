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
     * @param ValueStorageInterface $request
     */
    public static function run( ValueStorageInterface $request )
    {
        if (!defined( 'KB_ONSITE_ACTIVE' )) {
            define( 'KB_ONSITE_ACTIVE', true );
        }
        $panelDef = $request->getFiltered( 'panel', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $data = $request->getFiltered( 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $baseId = $panelDef['baseId'];
        $panelData = wp_unslash($data[$baseId]);

        $panel = \Kontentblocks\getPanel($baseId);
        $old = $panel->getData();
        $new = $panel->fields($panel->fieldController)->save($panelData, $old);

        $merged = Utilities::arrayMergeRecursive( $new, $old );
        $panel->dataProvider->set($merged)->save();

        $return = array(
            'newData' => $panel->dataProvider->export()
        );
        new AjaxSuccessResponse( 'options data saved', $return );
    }
}
