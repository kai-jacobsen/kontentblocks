<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Modules\ModuleRegistry;

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

        check_ajax_referer('kb-create');

        // ------------------------------------
        // The Program
        // ------------------------------------
        // Setup Data from $_POST
        $this->setupRequestData();

        // Setup Data Handler
        $this->environment = $this->setupEnvironment();

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

    private function setupEnvironment()
    {
        return \Kontentblocks\Helper\getEnvironment( $this->post_id );

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
        $prefix = apply_filters( 'kb_post_module_prefix', 'module_' );
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
                $this->moduleArgs[ 'settings' ][ 'public_name' ] = $tpl[ 'name' ];
            }
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
        unset($toSave['settings']);
        // add new block and update
        $update = $this->environment->getStorage()->addToIndex( $this->newInstanceID, $toSave );
        if ( $update !== true && !is_int( $update ) ) {
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
            'module' => $this->newModule,
            'name' => $this->newInstance->settings[ 'public_name' ],
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
        $this->type    = filter_var( $_POST[ 'class' ], FILTER_SANITIZE_STRING );

        $moduleArgs = array(
            'area' => FILTER_SANITIZE_STRING,
            'master' => FILTER_VALIDATE_BOOLEAN,
            'master_reference' => FILTER_SANITIZE_STRING,
            'areaContext' => FILTER_SANITIZE_STRING,
            'class' => FILTER_SANITIZE_STRING
        );

        $metaArgs = array(
            'template' => FILTER_VALIDATE_BOOLEAN,
            'template_reference' => FILTER_SANITIZE_STRING
        );

        $this->metaArgs   = filter_var_array( $_POST, $metaArgs );
        $this->moduleArgs = filter_var_array( $_POST, $moduleArgs );

    }

    public function createModuleInstance()
    {
        $Factory = new ModuleFactory($this->type ,$this->newModule, $this->environment );
        return $Factory->getModule();

    }

}
