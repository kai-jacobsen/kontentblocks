<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SaveOptionPanelForm
 * retrieves the html for a panels form
 * used for the frontend edit modal
 */
class SaveOptionPanelForm extends AbstractAjaxAction
{
    static $nonce = 'kb-update';


    /**
     * @param Request $request
     */
    protected static function action(Request $request)
    {
        if (!defined('KB_ONSITE_ACTIVE')) {
            define('KB_ONSITE_ACTIVE', true);
        }
        $panelDef = $request->request->filter('panel', array(), FILTER_DEFAULT);
        $data = $request->request->filter('data', array(), FILTER_DEFAULT);
        $baseId = $panelDef['baseId'];
        $panelData = wp_unslash($data[$baseId]);
        //@TODO rewrite, this is old
        $panel = \Kontentblocks\getPanel($baseId);
        $old = $panel->getData();
        $new = $panel->fields($panel->fieldController)->save($panelData, $old);

        $merged = Utilities::arrayMergeRecursive($new, $old);
        $panel->dataProvider->set($merged)->save();

        $return = array(
            'newData' => $panel->dataProvider->export()
        );
        new AjaxSuccessResponse('options data saved', $return);
    }
}
