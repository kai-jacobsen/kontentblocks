<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Frontend\RenderSettings;
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

    /**
     * @var AreaProperties
     */
    public $area;

    // equals either current pos object or the post object of the global module
    protected $parentObject;


    protected $environment;

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
     * @var ValueStorageInterface
     */
    private $request;


    /**
     * Required by AjaxCallbackHandler
     * @param ValueStorageInterface $request
     * @return CreateNewModule
     */
    public static function run( ValueStorageInterface $request )
    {
        $instance = new CreateNewModule();
        return $instance->create( $request );
    }

    /**
     * Get things going
     * @param ValueStorageInterface $request
     * @return AjaxSuccessResponse
     */
    public function create( ValueStorageInterface $request )
    {
        if (!defined( 'KB_GENERATE' )) {
            define( 'KB_GENERATE', true );
        }

        $this->request = $request;

        // Setup Data from $_POST
        $this->setupRequestData( $request );

        // Setup Data Handler
        $this->environment = Utilities::getEnvironment( $this->postId );
        $this->area = $this->environment->getAreaDefinition( $this->moduleArgs['area'] );

        // override class if master
        if (!$this->frontend) {
            $this->overrideModuleClassEventually();
        }

        // handle override from global modules
        $this->gmoduleOverride();

        $workshop = new ModuleWorkshop( $this->environment, $this->moduleArgs );
        $this->newModule = $workshop->createAndGet();

        return $this->render();

    }

    /**
     * Data send from js module definition object
     * @param ValueStorageInterface $request
     */
    private function setupRequestData( ValueStorageInterface $request )
    {
        global $post;

        $this->postId = $request->getFiltered( 'postId', FILTER_SANITIZE_NUMBER_INT );
        $this->frontend = $request->getFiltered( 'frontend', FILTER_VALIDATE_BOOLEAN );

        $post = get_post( $this->postId );
        setup_postdata( $post );

        $this->moduleArgs['class'] = $request->getFiltered( 'class', FILTER_SANITIZE_STRING );

//
//        if ($Request->getFiltered( 'globalModule', FILTER_VALIDATE_BOOLEAN )) {
//        }
        $this->moduleArgs['postId'] = absint( $this->postId );
        $this->moduleArgs['area'] = $request->getFiltered( 'area', FILTER_SANITIZE_STRING );
        $this->moduleArgs['areaContext'] = $request->getFiltered( 'areaContext', FILTER_SANITIZE_STRING );
        $this->moduleArgs['parentObjectId'] = absint( $request->get( 'parentObjectId' ) );

        $this->moduleArgs['globalModule'] = $this->globalModule = $request->getFiltered(
            'globalModule',
            FILTER_VALIDATE_BOOLEAN
        );

        $this->parentObject = $request->get( 'parentObject' );
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

        $addArgs = $this->request->get( 'renderSettings' );

        if (is_null( $addArgs )) {
            $addArgs = array();
        }

        $renderSettings = new RenderSettings( $addArgs, $this->area );

        $module = apply_filters( 'kb.module.before.factory', $this->newModule );
        if ($this->frontend) {
            $singleRenderer = new SingleModuleRenderer( $module, $renderSettings );
            $html = $singleRenderer->render();
        } else {
            $html = $module->renderForm();
        }
        $response = array
        (
            'id' => $this->newModule->getId(),
            'module' => $this->newModule->toJSON(),
            'name' => $this->newModule->properties->getSetting( 'name' ),
            'json' => Kontentblocks::getService( 'utility.jsontransport' )->getJSON(),
            'html' => $html
        );

        return new AjaxSuccessResponse( 'Module created', $response );

    }

}
