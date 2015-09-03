<?php

namespace Kontentblocks\Ajax\Actions\Frontend;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Reframe\Kontentblocks\Kontentblocks;

/**
 *
 * Class UpdateFieldModel
 * @package Kontentblocks\Ajax\Frontend
 */
class UpdateFieldModel implements AjaxActionInterface
{

    static $nonce = 'kb-update';


    /**
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $request )
    {

        $postdata = self::setupPostData( $request );

        switch ($postdata->type) {
            case 'module':
                // prepare
                $Storage = new ValueStorage(array(
                    'data' => self::prepareModuleData($postdata),
                    'module' => $postdata->module,
                    'editmode' => 'update'
                ));

                /** @var \Kontentblocks\Ajax\AbstractAjaxResponse $response */
                $response = UpdateModule::run($Storage, false);
                if ($response->getStatus()){
                    return new AjaxSuccessResponse('Field model updated', $response->getData());
                } else {
                    return new AjaxErrorResponse('Error during update', $response->getData());
                }
                break;
            case 'panel':
                $Storage = new ValueStorage(array(
                    'data' => self::prepareModuleData($postdata),
                    'panel' => $postdata->module
                ));
                $response = SaveStaticPanelForm::run($Storage);
                break;
        }

    }

    /**
     * @param ValueStorageInterface $request
     * @return \stdClass
     */
    private static function setupPostData( ValueStorageInterface $request )
    {
        $stdClass = new \stdClass();
        $stdClass->data = $request->get( 'data' );
        $stdClass->field = $request->getFiltered( 'field', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->module = $request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->type = $request->getFiltered( 'type', FILTER_SANITIZE_STRING );
        return $stdClass;
    }

    /**
     * @param $postdata
     * @return array
     */
    private static function prepareModuleData( $postdata )
    {

        $data = array();
        $field = $postdata->field;
        Utilities::assignArrayByPath($data, $field['kpath'], $postdata->data);
        return $data;
    }

}
