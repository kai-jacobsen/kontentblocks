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
     * @param ValueStorageInterface $Request
     * @return AjaxSuccessResponse
     */
    public static function run( ValueStorageInterface $Request )
    {
        global $post;

        $postdata = self::setupPostData( $Request );

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
                break;
        }

    }

    /**
     * @param ValueStorageInterface $Request
     * @return \stdClass
     */
    private static function setupPostData( ValueStorageInterface $Request )
    {
        $stdClass = new \stdClass();
        $stdClass->data = $Request->get( 'data' );
        $stdClass->field = $Request->getFiltered( 'field', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->module = $Request->getFiltered( 'module', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $stdClass->type = $Request->getFiltered( 'type', FILTER_SANITIZE_STRING );
        return $stdClass;
    }

    private static function prepareModuleData( $postdata )
    {

        $data = array();
        $field = $postdata->field;

        if (!empty($field['arrayKey'])){
            $data[$field['arrayKey']] = array(
                $field['fieldkey'] => $postdata->data
            );
        } else {
            $data[$field['fieldkey']] = $postdata->data;
        }


        return $data;
    }

}
