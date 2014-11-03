<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 * Class DuplicateModule
 * @package Kontentblocks\Ajax
 */
class DuplicateModule
{

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
     * id of the new module
     * @var string
     */
    private static $newInstanceId;

    /**
     *
     */
    public static function run()
    {
        // verify action
        check_ajax_referer( 'kb-create' );

        if (!current_user_can( 'create_kontentblocks' )) {
            wp_send_json_error();
        }

        self::$postId = filter_input( INPUT_POST, 'post_id', FILTER_SANITIZE_NUMBER_INT );
        self::$instanceId = filter_input( INPUT_POST, 'module', FILTER_SANITIZE_STRING );
        self::$class = filter_input( INPUT_POST, 'class', FILTER_SANITIZE_STRING );

        self::$Environment = Utilities::getEnvironment( self::$postId );

        self::$ModuleRegistry = Kontentblocks::getService( 'registry.modules' );

        self::$newInstanceId = self::createNewInstanceId();

        self::duplicate();

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

        $moduleDefinition = ModuleFactory::parseModule( $stored );
        $moduleDefinition['state']['draft'] = true;
        $moduleDefinition['instance_id'] = self::$newInstanceId;
        $moduleDefinition['mid'] = self::$newInstanceId;
        $toIndex = $moduleDefinition;

        //remove settings are never stored
        unset( $toIndex['settings'] );

        $update = self::$Environment->getStorage()->addToIndex( $toIndex['instance_id'], $toIndex );
        if ($update !== true) {
            wp_send_json_error( 'Update failed' );
        } else {
            $original = self::$Environment->getStorage()->getModuleData( self::$instanceId );
            self::$Environment->getStorage()->saveModule( self::$newInstanceId, $original );

            $moduleDefinition['areaContext'] = filter_var( $_POST['areaContext'], FILTER_SANITIZE_STRING );

            self::$Environment->getStorage()->reset();
            $moduleDefinition = apply_filters( 'kb_before_module_options', $moduleDefinition );

            $Factory = new ModuleFactory( self::$class, $moduleDefinition, self::$Environment );
            $Module = $Factory->getModule();


            ob_start();
            $Module->renderForm();
            $html = ob_get_clean();

            $response = array
            (
                'id' => self::$newInstanceId,
                'module' => $moduleDefinition,
                'name' => $Module->settings['publicName'],
                'html' => $html,
                'json' => JSONBridge::getInstance()->getJSON(),

            );
            wp_send_json( $response );
        }

    }

    /**
     * @return string
     */
    private static function createNewInstanceId()
    {
        $base = Utilities::getHighestId( self::$Environment->getStorage()->getIndex() );
        $prefix = apply_filters( 'kb_post_module_prefix', 'module_' );
        return $prefix . self::$postId . '_' . ++ $base;

    }

}
