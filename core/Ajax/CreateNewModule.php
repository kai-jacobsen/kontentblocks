<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\DataProvider\DataHandler;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 * Class CreateNewModule
 * @package Kontentblocks\Ajax
 */
class CreateNewModule
{
    /**
     * @var \Kontentblocks\Modules\ModuleRegistry
     */
    protected $ModuleRegistry;

    /**
     * $post_id
     * current post id
     * @var integer
     */
    private $postId = null;

    /**
     * $type
     * type of module
     * @var string
     */
    private $type = null;

    /**
     * $count
     * current module count
     * @var integer
     */
    private $newCount = null;

    /**
     * $new_id
     * holds the new id for the created module
     * @var string
     */
    private $newInstanceID;

    /**
     * $new_module
     * Array of data for the new module
     * @var array
     */
    private $newModule;


    private $moduleArgs;

    /**
     *
     */
    public function __construct()
    {
        if (!defined( 'KB_GENERATE' )) {
            define( 'KB_GENERATE', true );
        }

        check_ajax_referer( 'kb-create' );

        // ------------------------------------
        // The Program
        // ------------------------------------
        // Setup Data from $_POST
        $this->setupRequestData();

        // Setup Data Handler
        $this->Environment = Utilities::getEnvironment( $this->postId );

        $this->ModuleRegistry = Kontentblocks::getService( 'registry.modules' );

        // Setup new Count var
        $this->newCount = $this->_updateCount();

        // new instance id
        $this->newInstanceID = $this->setupNewID();

        // override class if master
        $this->overrideModuleClassEventually();

        // handle override from template
        $this->templateOverride();

        // Setup module args
        $this->newModule = $this->setupModuleArgs();
        $this->updateData();

    }


    private function overrideModuleClassEventually()
    {
        // Override Class / type if this originates from a master template
        $this->moduleArgs = apply_filters( 'kb_intercept_module_args', $this->moduleArgs );
    }

    /**
     * Setup Module
     *
     * instantiate the module and setup
     * @global $Kontentblocks
     * @return array|null
     */
    private function setupModuleArgs()
    {

        // Get Prototype from registry
        if (class_exists( $this->type )) {
            $proto = $this->ModuleRegistry->get( $this->type );
            $proto = wp_parse_args( $this->moduleArgs, $proto );
            $proto['instance_id'] = $this->newInstanceID;
            return $proto;
        } else {
            wp_send_json_error( $this->type . ' does not exist' );
        }
    }

    /**
     * Update Count
     *
     * Set the counter as reference for the new module id
     * counting doesn't start with zero
     */
    private function _updateCount()
    {
        $count = $this->count;

        if ($count != 0) {
            return $count + 1;
        } else {
            return 1;
        }

    }

    /**
     * Set new Module id
     *
     * Unique id for new module
     */
    private function setupNewID()
    {
        $prefix = apply_filters( 'kb_post_module_prefix', 'module_' );
        return $prefix . $this->postId . '_' . $this->newCount;

    }

    /**
     * Prepare new Module
     */
    private function templateOverride()
    {

        if ($this->moduleArgs['template']) {
            $this->moduleArgs['overrides']['name'] = $this->moduleArgs['templateObj']['name'];
        }

    }

    /**
     * Update Data
     * If something goes wrong each method might fire wp_send_json_error
     */
    private function updateData()
    {

        //save module to reference array
        $this->saveNewModule();

        // handle template generation
        $this->handleTemplates();


        $this->render();

    }

    /**
     * Save new module to post meta
     */
    private function saveNewModule()
    {
        $toSave = $this->newModule;


        //dont save settings
        unset( $toSave['settings'] );

        // add new block and update
        $update = $this->Environment->getStorage()->addToIndex( $this->newInstanceID, $toSave );
        if ($update === false) {
            wp_send_json_error( 'Update to Index failed' );
        }

        // @TODO deprecate
        do_action( 'kb::create:module', $this->newModule, $this->Environment );
        do_action( 'kb.module.create', $this->newModule );
    }

    /**
     * Handle generation from Template
     */
    private function handleTemplates()
    {
        //create data for templates
        if ($this->moduleArgs['template']) {

            $PostMeta = new DataHandler( $this->moduleArgs['master_id'] );

            $master_data = $PostMeta->get( '_' . $this->moduleArgs['templateObj']['id'] );
            $update = $this->Environment->getStorage()->saveModule( $this->newInstanceID, $master_data );
            $this->Environment->getStorage()->reset();

            if (!$update) {
                wp_send_json_error( 'Update not successful' );
            }
        }

    }

    /**
     * Output result
     */
    private function render()
    {
        ob_start();

        // create the new module finally
        $this->newInstance = $this->createModuleInstance();

        $this->newInstance->renderOptions();
        $html = ob_get_clean();
        $response = array
        (
            'id' => $this->newInstanceID,
            'module' => $this->newModule,
            'name' => $this->newInstance->settings['publicName'],
            'json' => JSONBridge::getInstance()->getJSON(),
            'html' => $html
        );

        wp_send_json( $response );

    }

    /**
     * Data send from js module definition object
     */
    private function setupRequestData()
    {
        global $post;
//        if ( !wp_verify_nonce( $_POST[ 'nonce' ], '_kontentblocks_ajax_magic' ) ) {
//            wp_send_json( wp_verify_nonce( $_POST[ 'nonce' ], '_kontentblocks_ajax_magic' ) );
//        }

        $this->postId = filter_var( $_POST['post_id'] );

        $post = get_post( $this->postId );
        setup_postdata( $post );

        $this->count = filter_var( $_POST['count'], FILTER_VALIDATE_INT );
        $this->type = filter_var( $_POST['class'], FILTER_SANITIZE_STRING );

        $moduleArgs = array(
            'area' => FILTER_SANITIZE_STRING,
            'master' => FILTER_VALIDATE_BOOLEAN,
            'areaContext' => FILTER_SANITIZE_STRING,
            'template' => FILTER_VALIDATE_BOOLEAN,
            'class' => FILTER_SANITIZE_STRING,
            'master_id' => FILTER_SANITIZE_NUMBER_INT,
            'parentId' => FILTER_SANITIZE_NUMBER_INT,
            'viewfile' => FILTER_SANITIZE_STRING
        );


        $this->moduleArgs = filter_var_array( $_POST, $moduleArgs );

        if (isset( $_POST['templateObj'] )) {
            $this->moduleArgs['templateObj']['name'] = $_POST['templateObj']['post_title'];
            $this->moduleArgs['templateObj']['id'] = $_POST['templateObj']['post_name'];
        }

    }

    public function createModuleInstance()
    {
        $module = apply_filters( 'kb_before_module_options', $this->newModule );
        $Factory = new ModuleFactory( $module['class'], $module, $this->Environment );
        return $Factory->getModule();

    }

}
