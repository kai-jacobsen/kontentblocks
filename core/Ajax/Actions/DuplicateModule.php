<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Class DuplicateModule
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class DuplicateModule implements AjaxActionInterface
{

    public static $nonce = 'kb-create';

    /**
     * @var int
     */
    private static $postId;

    /**
     * @var Environment
     */
    private static $environment;

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
    public static function run( ValueStorageInterface $request )
    {

        if (!current_user_can( 'create_kontentblocks' )) {
            return new AjaxErrorResponse( 'insufficient permissions' );
        }

        self::$postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        self::$instanceId = $request->getFiltered( 'module', FILTER_SANITIZE_STRING );
        self::$class = $request->getFiltered( 'class', FILTER_SANITIZE_STRING );

        self::$environment = Utilities::getEnvironment( self::$postId );
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
        $stored = self::$environment->getStorage()->getModuleDefinition(
            self::$instanceId
        );
        $workshop = new ModuleWorkshop(
            self::$environment, array(
            'state' => array(
                'draft' => true,
                'active' => true
            ),
            'class' => self::$class,
            'area' => $stored['area'],
            'areaContext' => $stored['areaContext']
        ), $stored //  inherit from original
        );

        $update = self::$environment->getStorage()->addToIndex(
            $workshop->getNewId(),
            $workshop->getDefinitionArray()
        );
        if ($update !== true) {
            return new AjaxErrorResponse(
                'Duplication failed due to update error', array(
                    'update' => $update,
                    'modDef' => $workshop->getDefinitionArray()
                )
            );
        } else {
            return self::doDuplication( $workshop );
        }
    }

    /**
     * Actual duplication
     * @param $moduleWorkshop
     * @return AjaxSuccessResponse
     */
    private static function doDuplication( ModuleWorkshop $moduleWorkshop )
    {
        $originalData = self::$environment->getStorage()->getModuleData( self::$instanceId );
        self::$environment->getStorage()->saveModule( $moduleWorkshop->getPropertiesObject()->mid, $originalData );

        self::$environment->getStorage()->reset();

        $module = $moduleWorkshop->getModule();

        apply_filters( 'kb.module.before.factory', $module );
        $html = $module->renderForm();
        $response = array
        (
            'id' => $moduleWorkshop->getPropertiesObject()->mid,
            'module' => $moduleWorkshop->getPropertiesObject(),
            'name' => $module->Properties->getSetting( 'publicName' ),
            'html' => $html,
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON(),

        );
        return new AjaxSuccessResponse( 'Module successfully duplicated', $response );
    }

}
