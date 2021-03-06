<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Runs after a module was dragged into a different area
 * Runs after the module template select field changed
 * Gets the module form for new/changed conditions
 *
 * Class AfterAreaChange
 */
class AfterAreaChange extends AbstractAjaxAction
{
    /**
     * @var string
     */
    static $nonce = 'kb-read';

    /**
     * Resulting form is based on the posted module definition to handle unsaved changes correctly
     * @param Request $request
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {
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
