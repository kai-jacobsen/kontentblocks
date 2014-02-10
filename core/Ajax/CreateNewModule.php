<?php

namespace Kontentblocks\Ajax;

use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Backend\API\PostMetaAPI;
use Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Modules\ModuleTemplates;

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
        if (!defined('KB_GENERATE')) {
            define('KB_GENERATE', true);
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

        // override class if master
        $this->overrideModuleClassEventually();

        // handle override from template
        $this->templateOverride();

        // Setup module args
        $this->newModule = $this->setupModuleArgs();
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
        return \Kontentblocks\Helper\getEnvironment($this->post_id);

    }

    private function overrideModuleClassEventually()
    {
        // Override Class / type if this originates from a master template
        $this->moduleArgs = apply_filters('kb_intercept_module_args', $this->moduleArgs);



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
        if (class_exists($this->type)) {
            $proto = ModuleRegistry::getInstance()->get($this->type);
            $proto = wp_parse_args($this->moduleArgs, $proto);
            $proto['instance_id'] = $this->newInstanceID;
            return $proto;
        } else {
            wp_send_json_error($this->type . ' does not exist');
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
        $prefix = apply_filters('kb_post_module_prefix', 'module_');
        if ($this->post_id !== -1) {
            return $prefix . $this->post_id . '_' . $this->newCount;
        } else {
            return $prefix . 'kb-block-da' . $this->moduleArgs['area'] . '_' . $this->newCount;
        }

    }

    /**
     * Prepare new Module
     */
    private function templateOverride()
    {

        if ($this->moduleArgs['template']) {
                $this->moduleArgs[ 'overrides' ][ 'name' ] = $this->moduleArgs['templateObj']['name'];
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
        $update = $this->environment->getStorage()->addToIndex($this->newInstanceID, $toSave);
        if ($update !== true && !is_int($update)) {
            wp_send_json_error('Update to Index failed');
        }

    }

    /**
     * Handle generation from Template
     */
    private function handleTemplates()
    {
        //create data for templates
        if ($this->moduleArgs['template']) {

            $PostMeta = new PostMetaAPI($this->moduleArgs['master_id']);

            $master_data = $PostMeta->get($this->moduleArgs['templateObj']['id']);
            $update = $this->environment->getStorage()->saveModule($this->newInstanceID, $master_data);
            $this->environment->getStorage()->reset();
            if (!$update)
                wp_send_json_error('Upddate not successful');
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

        $this->newInstance->_render_options();
        $html = ob_get_clean();
        $response = array
        (
            'id' => $this->newInstanceID,
            'module' => $this->newModule,
            'name' => $this->newInstance->settings['public_name'],
            'html' => $html
        );

        wp_send_json($response);

    }

    private function setupRequestData()
    {

//        if ( !wp_verify_nonce( $_POST[ 'nonce' ], '_kontentblocks_ajax_magic' ) ) {
//            wp_send_json( wp_verify_nonce( $_POST[ 'nonce' ], '_kontentblocks_ajax_magic' ) );
//        }

        $this->post_id = filter_var($_POST['post_id']);
        $this->count = filter_var($_POST['count'], FILTER_VALIDATE_INT);
        $this->type = filter_var($_POST['class'], FILTER_SANITIZE_STRING);

        $moduleArgs = array(
            'area' => FILTER_SANITIZE_STRING,
            'master' => FILTER_VALIDATE_BOOLEAN,
            'areaContext' => FILTER_SANITIZE_STRING,
            'template' => FILTER_VALIDATE_BOOLEAN,
            'class' => FILTER_SANITIZE_STRING,
            'master_id' => FILTER_SANITIZE_NUMBER_INT,
        );

//        $metaArgs = array(
//            'template' => FILTER_VALIDATE_BOOLEAN,
//            'templateReference' => FILTER_SANITIZE_STRING
//        );

//        $this->metaArgs = filter_var_array($_POST, $metaArgs);
        $this->moduleArgs = filter_var_array($_POST, $moduleArgs);

        if (isset($_POST['templateObj'])){
            $this->moduleArgs['templateObj']['name'] = $_POST['templateObj']['post_title'];
            $this->moduleArgs['templateObj']['id'] = $_POST['templateObj']['post_name'];
        }

    }

    public function createModuleInstance()
    {
        $Factory = new ModuleFactory($this->newModule['class'], $this->newModule, $this->environment);
        return $Factory->getModule();

    }

}
