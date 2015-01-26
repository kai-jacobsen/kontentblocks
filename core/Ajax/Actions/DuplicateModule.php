<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Class DuplicateModule
 * @package Kontentblocks\Ajax
 */
class DuplicateModule
{

    public static $nonce = 'kb-create';

    /**
     * @var int
     */
    private static $postId;

    /**
     * @var Environment
     */
    private static $Environment;

    /**
     * ID of original module
     * @var string
     */
    private static $instanceId;

    /**
     * Classname of Module
     * @var string
     */
    private static $class;

    /**
     *
     */
    public static function run( ValueStorageInterface $Request )
    {

        if (!current_user_can( 'create_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        self::$postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        self::$instanceId = $Request->getFiltered( 'module', FILTER_SANITIZE_STRING );
        self::$class = $Request->getFiltered( 'class', FILTER_SANITIZE_STRING );

        self::$Environment = Utilities::getEnvironment( self::$postId );
        return self::duplicate();
    }


    /**
     * @return AjaxErrorResponse|AjaxSuccessResponse
     */
    private static function duplicate()
    {
        global $post;
        $post = get_post( self::$postId );
        setup_postdata( $post );

        // get & setup original
        $stored = self::$Environment->getStorage()->getModuleDefinition(
            self::$instanceId
        );
        $Workshop = new ModuleWorkshop(
            self::$Environment, array(
            'state' => array(
                'draft' => true,
                'active' => true
            ),
            'class' => self::$class,
            'area' => $stored['area'],
            'areaContext' => $stored['areaContext']
        ), $stored //  inherit from original
        );

        $update = self::$Environment->getStorage()->addToIndex(
            $Workshop->getNewId(),
            $Workshop->getDefinitionArray()
        );
        if ($update !== true) {
            return new AjaxErrorResponse(
                'Duplication failed due to update error', array(
                    'update' => $update,
                    'modDef' => $Workshop->getDefinitionArray()
                )
            );
        } else {
            return self::doDuplication( $Workshop );
        }
    }

    /**
     * Actual duplication
     * @param $ModuleWorkshop
     * @return AjaxSuccessResponse
     */
    private static function doDuplication( ModuleWorkshop $ModuleWorkshop )
    {
        $originalData = self::$Environment->getStorage()->getModuleData( self::$instanceId );
        self::$Environment->getStorage()->saveModule( $ModuleWorkshop->getPropertiesObject()->mid, $originalData );

        self::$Environment->getStorage()->reset();

        $Module = $ModuleWorkshop->getModule();

        apply_filters( 'kb.module.before.factory', $Module );
        $html = $Module->renderForm();
        $response = array
        (
            'id' => $ModuleWorkshop->getPropertiesObject()->mid,
            'module' => $ModuleWorkshop->getPropertiesObject(),
            'name' => $Module->Properties->getSetting( 'publicName' ),
            'html' => $html,
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON(),

        );
        return new AjaxSuccessResponse( 'Module successfully duplicated', $response );
    }

}
