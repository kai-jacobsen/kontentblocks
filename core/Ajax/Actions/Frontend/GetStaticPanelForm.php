<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Kontentblocks;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GetStaticPanelForm
 * retrieves the html for a panels form
 * used for the frontend edit modal
 */
class GetStaticPanelForm extends AbstractAjaxAction
{
    static $nonce = 'kb-read';


    /**
     * @param Request $request
     */
    protected static function action(Request $request)
    {
        if (!defined('KB_ONSITE_ACTIVE')) {
            define('KB_ONSITE_ACTIVE', true);
        }
        $panelDef = $request->request->filter('panel', array(), FILTER_DEFAULT);
        $panId = filter_var($panelDef['baseId'], FILTER_SANITIZE_STRING);
        $postId = filter_var($panelDef['postId'], FILTER_SANITIZE_NUMBER_INT);

        $panel = \Kontentblocks\getPostPanel($panId, $postId);
        $pdata = (!empty($panelDef['entityData'])) ? wp_unslash($panelDef['entityData']) : array();
        $panel->setData($pdata);
        $return = array(
            'html' => $panel->renderFields(),
            'json' => Kontentblocks::getService('utility.jsontransport')->getJSON()
        );
        new AjaxSuccessResponse('serving module form', $return);
    }
}
