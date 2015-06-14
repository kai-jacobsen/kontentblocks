<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
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
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class CreateNewModule implements AjaxActionInterface
{

    public static $nonce = 'kb-create';

    // equals either current pos object or the post object of the global module
    protected $parentObject;


    protected $Environment;

    /**
     * ID of the origin post
     * @var integer
     */
    private $postId;


    /**
     * global module indicator
     * @var bool
     */
    private $globalModule = false;

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


        // handle override from global modules
        $this->gmoduleOverride();

        $Workshop = new ModuleWorkshop( $this->Environment, $this->moduleArgs );
        $this->newModule = $Workshop->createAndGet();

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
        // will set the origin class to internal core module
        $this->moduleArgs = apply_filters( 'kb.intercept.creation.args', $this->moduleArgs );
    }


    /**
     * Set the module name to the name of the template
     */
    private function gmoduleOverride()
    {
        if ($this->moduleArgs['globalModule']) {
            $this->moduleArgs['overrides']['name'] = $this->parentObject['post_title'];
        }
    }


    /**
     * Output result
     */
    private function render()
    {

        ob_start();

        $Module = apply_filters( 'kb.module.before.factory', $this->newModule );
        if ($this->frontend) {
            $SingleRenderer = new SingleModuleRenderer( $Module );
            echo $SingleRenderer->render();
        } else {
            echo $Module->renderForm();
        }
        $html = ob_get_clean();
        $response = array
        (
            'id' => $this->newModule->getId(),
            'module' => $this->newModule->toJSON(),
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


        if ($Request->getFiltered( 'globalModule', FILTER_VALIDATE_BOOLEAN )) {
            $this->moduleArgs['post_id'] = absint( $Request->get( 'parentObjectId' ) );
        }

        $this->moduleArgs['area'] = $Request->getFiltered( 'area', FILTER_SANITIZE_STRING );
        $this->moduleArgs['areaContext'] = $Request->getFiltered( 'areaContext', FILTER_SANITIZE_STRING );
        $this->moduleArgs['parentObjectId'] = absint( $Request->get( 'parentObjectId' ) );

        $this->moduleArgs['globalModule'] = $this->globalModule = $Request->getFiltered(
            'globalModule',
            FILTER_VALIDATE_BOOLEAN
        );

        $this->parentObject = $Request->get( 'parentObject' );
    }

}
