<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Runs after a module was dragged into a different area
 * Runs after the module view select field changed
 * Gets the module form for new/changed conditions
 *
 * Class AfterAreaChange
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class AfterAreaChange implements AjaxActionInterface
{
    static $nonce = 'kb-read';

    /**
     * Get going
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function run(Request $request)
    {
        if (!current_user_can('edit_kontentblocks')) {
            return new AjaxErrorResponse('Your user role does not have enough permissions for this action');
        }
        $postId = $request->request->getInt('postId', null);
        $moduleDef = $request->request->filter('module', null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        $workshop = new ModuleWorkshop(Utilities::getPostEnvironment($postId), $moduleDef);
        $module = $workshop->getModule();
        $html = $module->form();
        $return = array(
            'html' => $html,
            'json' => Kontentblocks::getService('utility.jsontransport')->getJSON()
        );
        return new AjaxSuccessResponse('Area changed', $return);
    }
}
