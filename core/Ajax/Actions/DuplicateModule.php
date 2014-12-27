<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleRegistry;
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
     * @var PostEnvironment
     */
    private static $Environment;

    /**
     * @var ModuleRegistry
     */
    private static $ModuleRegistry;

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

        self::$ModuleRegistry = Kontentblocks::getService( 'registry.modules' );

        return self::duplicate();
    }


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
            )
        );

        $moduleDefinition = wp_parse_args( $Workshop->getDefinitionArray(), $stored );

        $update = self::$Environment->getStorage()->addToIndex( $moduleDefinition['mid'], $moduleDefinition );
        if ($update !== true) {
            return new AjaxErrorResponse(
                'Duplication failed due to update error', array(
                    'update' => $update,
                    'modDef' => $moduleDefinition,
                    'workshop' => $Workshop->getDefinitionArray()
                )
            );
        } else {
            return self::doDuplication( $moduleDefinition );
        }
    }

    /**
     * Actual duplication
     * @param $moduleDefinition
     * @return AjaxSuccessResponse
     */
    private static function doDuplication( $moduleDefinition )
    {
        $originalData = self::$Environment->getStorage()->getModuleData( self::$instanceId );
        self::$Environment->getStorage()->saveModule( $moduleDefinition['mid'], $originalData );

        self::$Environment->getStorage()->reset();
        $moduleDefinition = apply_filters( 'kb.module.before.factory', $moduleDefinition );

        $Factory = new ModuleFactory( self::$class, $moduleDefinition, self::$Environment );
        $Module = $Factory->getModule();
        ob_start();
        $Module->renderForm();
        $html = ob_get_clean();

        $response = array
        (
            'id' => $moduleDefinition['mid'],
            'module' => $moduleDefinition,
            'name' => $Module->settings['publicName'],
            'html' => $html,
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON(),

        );
        return new AjaxSuccessResponse( 'Module successfully duplicated', $response );
    }

}
