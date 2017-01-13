<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Utils\Utilities;
use Reframe\Kontentblocks\Kontentblocks;
use Symfony\Component\HttpFoundation\Request;

/**
 *
 * Class UpdateFieldModel
 * Saves data on single field level
 */
class UpdateFieldModel extends AbstractAjaxAction
{
    static $nonce = 'kb-update';

    /**
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    protected static function action(Request $request)
    {

        $postdata = self::setupPostData($request);

        switch ($postdata->type) {
            case 'module':
                // prepare
                $request->request->add(array(
                    'data' => self::prepareModuleData($postdata),
                    'module' => $postdata->module,
                    'editmode' => 'update'
                ));

                /** @var \Kontentblocks\Ajax\AbstractAjaxResponse $response */
                $response = UpdateModule::run($request, false);
                if ($response->getStatus()) {
                    return new AjaxSuccessResponse('Field model updated', $response->getData());
                } else {
                    return new AjaxErrorResponse('Error during update', $response->getData());
                }
                break;
            case 'panel':
                $request->request->add(array(
                    'data' => self::prepareModuleData($postdata),
                    'panel' => $postdata->module
                ));
                $response = SaveStaticPanelForm::run($request);
                break;
        }
    }

    /**
     * @param Request $request
     * @return \stdClass
     */
    private static function setupPostData(Request $request)
    {
        $stdClass = new \stdClass();
        $stdClass->data = $request->request->get('data');
        $stdClass->field = $request->request->filter('field', array(), FILTER_DEFAULT);
        $stdClass->module = $request->request->filter('module', array(), FILTER_DEFAULT);
        $stdClass->type = $request->request->filter('type', null, FILTER_SANITIZE_STRING);
        return $stdClass;
    }

    /**
     * @param $postdata
     * @return array
     */
    private static function prepareModuleData($postdata)
    {

        $data = array();
        $field = $postdata->field;
        Utilities::assignArrayByPath($data, $field['kpath'], $postdata->data);
        return $data;
    }

}
