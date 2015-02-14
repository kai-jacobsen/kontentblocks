<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Common\Data\ValueStorageInterface;
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

    public static $nonce = 'kb-create';

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
     * Required by AjaxCallbackHandler
     * @param ValueStorageInterface $Request
     * @return CreateNewModule
     */
    public static function run( ValueStorageInterface $Request )
    {
        $Instance = new CreateNewModule();
        return $Instance->create( $Request );
    }

    /**
     * Get things going
     * @param ValueStorageInterface $Request
     * @return AjaxSuccessResponse
     */
    public function create( ValueStorageInterface $Request )
    {
        if (!defined( 'KB_GENERATE' )) {
            define( 'KB_GENERATE', true );
        }

        // ------------------------------------
        // The Program
        // ------------------------------------
        // Setup Data from $_POST
        $this->setupRequestData( $Request );

        // Setup Data Handler
        $this->Environment = Utilities::getEnvironment( $this->postId );

        // override class if master
        if (!$this->frontend) {
            $this->overrideModuleClassEventually();
        }


        // handle override from template
        $this->templateOverride();

        $Workshop = new ModuleWorkshop( $this->Environment, $this->moduleArgs );
        $this->newModule = $Workshop->createAndGet();
        $this->updateData();

        return $this->render();

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
//        $this->saveNewModule();
        // handle template generation
        $this->handleTemplates();

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
            return new AjaxErrorResponse( 'Failed to store new module in index', array( 'updateStatus' => $update ) );
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
                return new AjaxErrorResponse( 'Failed to create from Template', array( 'updateStatus' => $update ) );
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
            echo $SingleRenderer->render();
        } else {
            echo $this->newModule->renderForm();
        }
        $html = ob_get_clean();
        $response = array
        (
            'id' => $this->newModule->getId(),
            'module' => $this->newModule->Properties->export(true),
            'name' => $this->newModule->Properties->getSetting( 'publicName' ),
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON(),
            'html' => $html
        );

        return new AjaxSuccessResponse( 'Module created', $response );

    }

    /**
     * Data send from js module definition object
     * @param ValueStorageInterface $Request
     */
    private function setupRequestData( ValueStorageInterface $Request )
    {
        global $post;

        $this->postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $this->frontend = $Request->getFiltered( 'frontend', FILTER_VALIDATE_BOOLEAN );

        $post = get_post( $this->postId );
        setup_postdata( $post );

        $this->moduleArgs['class'] = $Request->getFiltered( 'class', FILTER_SANITIZE_STRING );


        if (!is_array( $Request->get( 'templateRef' ) )) {
            $this->moduleArgs['templateRef']['name'] = $Request->get( 'templateRef' )['post_title'];
            $this->moduleArgs['templateRef']['id'] = $Request->get( 'templateRef' )['post_name'];
        }

        if ($Request->getFiltered( 'master', FILTER_VALIDATE_BOOLEAN )) {
            $this->moduleArgs['post_id'] = absint( $Request->get( 'masterRef' )['parentId'] );
            $this->moduleArgs['masterRef']['parentId'] = absint( $Request->get( 'masterRef' )['parentId'] );
        }

        $this->moduleArgs['area'] = $Request->getFiltered( 'area', FILTER_SANITIZE_STRING );
        $this->moduleArgs['areaContext'] = $Request->getFiltered( 'areaContext', FILTER_SANITIZE_STRING );

        $this->moduleArgs['master'] = $Request->getFiltered( 'master', FILTER_VALIDATE_BOOLEAN );
        $this->moduleArgs['template'] = $Request->getFiltered( 'template', FILTER_VALIDATE_BOOLEAN );

        if ($this->moduleArgs['master']) {
            $this->master = true;
        }

        if ($this->moduleArgs['template']) {
            $this->template = true;
        }
    }

}
