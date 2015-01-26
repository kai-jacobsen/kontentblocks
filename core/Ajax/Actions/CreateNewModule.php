<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Frontend\SingleModuleRenderer;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;

/**
 * Class CreateNewModule
 * @package Kontentblocks\Ajax
 */
class CreateNewModule
{

    /**
     * ID of the origin post
     * @var integer
     */
    private $postId;

    /**
     * Master indicator
     * @var bool
     */
    private $master = false;

    /**
     * Template indicator
     * @var bool
     */
    private $template = false;

    /**
     * $new_module
     * Array of data for the new module
     * @var \Kontentblocks\Modules\Module
     */
    private $newModule;

    /**
     * collected module args
     * @var array
     */
    private $moduleArgs;

    /**
     * Context indicator
     * @var bool
     */
    private $frontend = false;

    /**
     * Get things going
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

        // override class if master
        if (!$this->frontend) {
            $this->overrideModuleClassEventually();
        }


        // handle override from template
        $this->templateOverride();

        $Workshop = new ModuleWorkshop( $this->Environment, $this->moduleArgs );
        $this->newModule = $Workshop->getModule();
        $this->updateData();

    }

    /**
     * Internale core master module will rewrite the classname to itself
     * if master = true
     *
     */
    private function overrideModuleClassEventually()
    {
        // Override Class / type if this originates from a master template
        $this->moduleArgs = apply_filters( 'kb.intercept.creation.args', $this->moduleArgs );
    }


    /**
     * Set the module name to the name of the template
     */
    private function templateOverride()
    {
        if ($this->moduleArgs['template']) {
            $this->moduleArgs['overrides']['name'] = $this->moduleArgs['templateRef']['name'];
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
        $toSave = $this->newModule->Properties->export();

        // add new block and update
        $update = $this->Environment->getStorage()->addToIndex( $this->newModule->getId(), $toSave );
        if ($update === false) {
            wp_send_json_error( 'Update to Index failed' );
        }

        /**
         * Action kb.module.create
         * @Param array attributes of new module
         */
        do_action( 'kb.module.create', $this->newModule->Properties->export() );
    }

    /**
     * Handle generation from Template
     */
    private function handleTemplates()
    {
        //create data for templates
        if ($this->template) {
            $PostMeta = new DataProviderController( $this->newModule->Properties->masterRef['parentId'] );

            $master_data = $PostMeta->get( '_' . $this->moduleArgs['templateRef']['id'] );
            $update = $this->Environment->getStorage()->saveModule( $this->newModule->getId(), $master_data );
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

        if ($this->frontend) {
            $SingleRenderer = new SingleModuleRenderer( $this->newModule );
            $SingleRenderer->render();
        } else {
            echo $this->newModule->renderForm();
        }
        $html = ob_get_clean();
        $response = array
        (
            'id' => $this->newModule->getId(),
            'module' => $this->newModule->Properties->export(),
            'name' => $this->newModule->Properties->getSetting( 'publicName' ),
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON(),
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

        $this->postId = filter_var( $_POST['post_id'], FILTER_SANITIZE_NUMBER_INT );
        $this->frontend = filter_input( INPUT_POST, 'frontend', FILTER_VALIDATE_BOOLEAN );

        $post = get_post( $this->postId );
        setup_postdata( $post );

        $this->moduleArgs['class'] = $this->classname = filter_var( $_POST['class'], FILTER_SANITIZE_STRING );

        if (isset( $_POST['templateRef'] )) {
            $this->moduleArgs['templateRef']['name'] = $_POST['templateRef']['post_title'];
            $this->moduleArgs['templateRef']['id'] = $_POST['templateRef']['post_name'];
        }

        if (filter_input( INPUT_POST, 'master', FILTER_VALIDATE_BOOLEAN )) {
            $this->moduleArgs['post_id'] = absint( $_POST['masterRef']['parentId'] );
            $this->moduleArgs['masterRef']['parentId'] = absint( $_POST['masterRef']['parentId'] );
        }

        $this->moduleArgs['area'] = filter_input( INPUT_POST, 'area', FILTER_SANITIZE_STRING );
        $this->moduleArgs['areaContext'] = filter_input( INPUT_POST, 'areaContext', FILTER_SANITIZE_STRING );

        $this->moduleArgs['master'] = filter_input( INPUT_POST, 'master', FILTER_VALIDATE_BOOLEAN );
        $this->moduleArgs['template'] = filter_input( INPUT_POST, 'template', FILTER_VALIDATE_BOOLEAN );

        if ($this->moduleArgs['master']) {
            $this->master = true;
        }

        if ($this->moduleArgs['template']) {
            $this->template = true;
        }
    }

}
