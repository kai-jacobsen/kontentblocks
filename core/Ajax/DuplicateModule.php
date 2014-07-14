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

    protected $postId;
    protected $dataHandler;
    protected $instanceId;

    /**
     * @var ModuleRegistry
     */
    protected $ModuleRegistry;

    /**
     * @var PostEnvironment
     */
    protected $Environment;

    /**
     *
     */
    public function __construct()
    {
        // verify action
        check_ajax_referer( 'kb-create' );

        if (!current_user_can( 'create_kontentblocks' )) {
            wp_send_json_error();
        }

        $this->postId = $_POST['post_id'];
        $this->instanceId = $_POST['module'];
        $this->class = $_POST['class'];

        $this->Environment = Utilities::getEnvironment( $this->postId );

        $this->ModuleRegistry = Kontentblocks::getService( 'registry.modules' );

        $this->newInstanceId = $this->getNewInstanceId();

        $this->duplicate();

    }


    private function duplicate()
    {
        // @TODO: Dangerous? Too hacky?
        // @TODO: what why?!??!
        global $post;
        $tempPost = $post;
        $post = get_post( $this->postId );

        $stored = $this->Environment->getStorage()->getModuleDefinition(
            $this->instanceId
        );
        $moduleDefinition = ModuleFactory::parseModule( $stored );
        $moduleDefinition['state']['draft'] = true;
        $moduleDefinition['instance_id'] = $this->newInstanceId;
        $toIndex = $moduleDefinition;
        unset( $toIndex['settings'] );

        $update = $this->Environment->getStorage()->addToIndex( $toIndex['instance_id'], $toIndex );
        if ($update !== true) {
            wp_send_json_error( 'Update failed' );
        } else {
            $original = $this->Environment->getStorage()->getModuleData( $this->instanceId );
            $this->Environment->getStorage()->saveModule( $this->newInstanceId, $original );

            $moduleDefinition['areaContext'] = filter_var( $_POST['areaContext'], FILTER_SANITIZE_STRING );

            $this->Environment->getStorage()->reset();
            $moduleDefinition = apply_filters( 'kb_before_module_options', $moduleDefinition );

            $Factory = new ModuleFactory( $this->class, $moduleDefinition, $this->Environment );
            $newInstance = $Factory->getModule();


            ob_start();
            $newInstance->renderOptions();
            $html = ob_get_clean();

            $response = array
            (
                'id' => $this->newInstanceId,
                'module' => $moduleDefinition,
                'name' => $newInstance->settings['publicName'],
                'html' => $html,
                'json' => JSONBridge::getInstance()->getJSON(),

            );

            $post = $tempPost;
            wp_send_json( $response );
        }

    }

    /**
     * @return string
     */
    public function getNewInstanceId()
    {
        $base = Utilities::getHighestId( $this->Environment->getStorage()->getIndex() );
        $prefix = apply_filters( 'kb_post_module_prefix', 'module_' );
        if ($this->postId !== - 1) {
            return $prefix . $this->postId . '_' . ++ $base;
        } else {
            return $prefix . 'kb-block-da' . $this->moduleArgs['area'] . '_' . ++ $base;
        }

    }

}
