<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Utils\PostMetaDataHandler,
    Kontentblocks\Utils\GlobalDataHandler,
    Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Utils\ModuleRegistry;

class CreateNewModule
{

    /**
     * $post_id
     * current post id
     * @var integer
     */
    private $post_id = null;

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
    private $newId;

    /**
     * $new_module
     * Array of data for the new module
     * @var array
     */
    private $newModule;

    public function __construct()
    {
        if ( !defined( 'KB_GENERATE' ) ) {
            define( 'KB_GENERATE', true );
        }

        // ------------------------------------
        // The Program 
        // ------------------------------------
        // Setup Data from $_POST
        $this->setupRequestData();

        // Setup Data Handler
        $this->dataHandler = $this->setupDataHandler();

        // Setup new Count var
        $this->newCount = $this->_updateCount();

        // new instance id
        $this->newInstanceID = $this->setupNewID();

        // Setup module args
        $this->newModule = $this->setupModuleArgs();

        // override class if master
        $this->overrideModuleClassEventually();

        // handle override from template
        $this->templateOverride();

        // create the new module finally
        $this->newInstance = $this->createModuleInstance();

        $this->updateData();

    }

    /*
     * Setup $_POST Data
     * sets class properties
     * 
     * data array should match properties
     * If any of the method calls fail validation, wp_send_json_error gets fired
     * and the Action exits.
     * No errors or unset data allowed. 
     */

    private function setupDataHandler()
    {


        // setup context specific data handler
        if ( $this->post_id == -1 ) {
            return new GlobalDataHandler();
        }
        else {
            return new PostMetaDataHandler( $this->post_id );
        }

    }

    private function overrideModuleClassEventually()
    {
        // Override Class / type if this originates from a master template
        if ( $this->moduleArgs[ 'master' ] ) {
            $this->moduleArgs[ 'class' ] = 'KB_Master_Module';
        }

    }

    /**
     * Setup Module
     * 
     * instantiate the module and setup
     * @global $Kontentblocks
     */
    private function setupModuleArgs()
    {
        // Get Prototype from registry
        if ( class_exists( $this->type ) ) {
            $proto                  = ModuleRegistry::getInstance()->get( $this->type );
            $proto                  = wp_parse_args( $this->moduleArgs, $proto );
            $proto[ 'instance_id' ] = $this->newInstanceID;
            return $proto;
        }
        else {
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

        if ( $count != 0 ) {
            return $count + 1;
        }
        else {
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
        $prefix = apply_filters( 'kb_post_module_prefix', 'module-' );
        if ( $this->post_id !== -1 ) {
            return $prefix . $this->post_id . '_' . $this->newCount;
        }
        else {
            return $prefix . 'kb-block-da' . $this->moduleArgs[ 'area' ] . '_' . $this->newCount;
        }

    }

    /**
     * Prepare new Module
     */
    private function templateOverride()
    {

        if ( $this->metaArgs[ 'template' ] ) {
            $globalData = new GlobalDataHandler();
            $tpl        = $globalData->getTemplate( $this->metaArgs[ 'template_reference' ] );
            if ( $tpl ) {
                $this->moduleArgs[ 'name' ] = $tpl[ 'name' ];
            }
        }

    }

    /**
     * Update Data
     * If something goes wrong each method might fire wp_send_json_error
     */
    private function updateData()
    {

        $this->newInstance->set( $this->postArgs );

        //save module to reference array
        $this->saveNewModule();

        // handle template generation
        $this->handleTemplates();

        // handle duplicates
        $this->handleDuplicate();

        $this->render();

    }

    /**
     * Save new module to post meta
     */
    private function saveNewModule()
    {
        // add new block and update 
        $update = $this->dataHandler->addToIndex( $this->newInstanceID, $this->newModule );
        if ( $update !== true ) {
            wp_send_json_error( 'Update failed' );
        }

    }

    /**
     * Handle generation from Template
     */
    private function handleTemplates()
    {
        //create data for templates
        if ( $this->metaArgs[ 'template' ] ) {
            $master_data = get_option( $this->metaArgs[ 'template_reference' ] );
            $update      = update_post_meta( $this->post_id, '_' . $this->newInstanceID, $master_data );

            if ( !$update )
                wp_send_json_error( 'Upddate not successful' );
        }

    }

    /**
     * Handle generation of duplicates
     */
    private function handleDuplicate()
    {

        if ( !empty( $this->metaArgs[ 'duplicate' ] ) ) {
            $master_data = get_post_meta( $this->post_id, '_' . $this->metaArgs[ 'duplicate_reference' ], true );
            $update      = update_post_meta( $this->post_id, '_' . $this->newInstanceID, $master_data );

            if ( !$update )
                wp_send_json_error( 'Upddate not successful' );
        }

    }

    /**
     * Output result
     */
    private function render()
    {

        ob_start();
        $this->newInstance->_render_options();
        $html = ob_get_clean();

        $response = array
            (
            'id' => $this->newInstanceID,
            'module' => get_object_vars( $this->newInstance ),
            'name' => $this->newInstance->public_name,
            'html' => $html
        );

        wp_send_json( $response );

    }

    private function setupRequestData()
    {

//        if ( !wp_verify_nonce( $_POST[ 'nonce' ], '_kontentblocks_ajax_magic' ) ) {
//            wp_send_json( wp_verify_nonce( $_POST[ 'nonce' ], '_kontentblocks_ajax_magic' ) );
//        }

        $this->post_id = filter_var( $_POST[ 'post_id' ], FILTER_VALIDATE_INT );
        $this->count   = filter_var( $_POST[ 'count' ], FILTER_VALIDATE_INT );
        $this->type = filter_var($_POST['type'], FILTER_SANITIZE_STRING);
        
        $moduleArgs    = array(
            'area' => FILTER_SANITIZE_STRING,
            'master' => FILTER_VALIDATE_BOOLEAN,
            'master_reference' => FILTER_SANITIZE_STRING,
        );

        $postArgs = array(
            'page_template' => FILTER_SANITIZE_STRING,
            'post_type' => FILTER_SANITIZE_STRING,
            'area_context' => FILTER_SANITIZE_STRING
        );

        $metaArgs = array(
        'template' => FILTER_VALIDATE_BOOLEAN,
        'template_reference' => FILTER_SANITIZE_STRING,
        'duplicate' => FILTER_VALIDATE_BOOLEAN,
        'duplicate_reference' => FILTER_SANITIZE_STRING
        );

        $this->metaArgs = filter_var_array( $_POST, $metaArgs );
        $this->moduleArgs = filter_var_array( $_POST, $moduleArgs );
        $this->postArgs   = filter_var_array( $_POST, $postArgs );

    }

    public function createModuleInstance()
    {
        $Factory = new ModuleFactory( $this->newModule );
        return $Factory->getModule();

    }

}
