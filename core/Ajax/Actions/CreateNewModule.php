<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AbstractAjaxAction;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Frontend\Renderer\SingleModuleRenderer;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class CreateNewModule
 */
class CreateNewModule extends AbstractAjaxAction
{

    public static $nonce = 'kb-create';

    /**
     * @var AreaProperties
     */
    public $area;

    // equals either current pos object or the post object of the global module
    protected $parentObject;

    /**
     * @var
     */
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
    private $isFrontend = false;

    /**
     * @var bool
     */
    private $isSubmodule = false;

    /**
     * @var Request
     */
    private $request;


    /**
     * Required by AjaxCallbackHandler
     * @param Request $request
     * @return \Kontentblocks\Ajax\AjaxErrorResponse|AjaxSuccessResponse
     */
    public static function action(Request $request)
    {
        $instance = new CreateNewModule();
        return $instance->create($request);
    }

    /**
     * Get things going
     * @param Request $request
     * @return AjaxSuccessResponse
     */
    public function create(Request $request)
    {
        if (!defined('KB_GENERATE')) {
            define('KB_GENERATE', true);
        }

        $this->request = $request;

        // Setup Data from $_POST
        $this->setupRequestData($request);

        // Setup Data Handler
        $this->environment = Utilities::getPostEnvironment($this->postId);
        $this->area = $this->environment->getAreaDefinition($this->moduleArgs['area']);

        // override class if master
        if (!$this->isFrontend) {
            $this->overrideModuleClassEventually();
        }

        // handle override from global modules
        $this->gmoduleOverride();

        $workshop = new ModuleWorkshop($this->environment, $this->moduleArgs);
        $this->newModule = $workshop->createAndGet();

        return $this->render();

    }

    /**
     * Data send from js module definition object
     * @param Request $request
     */
    private function setupRequestData(Request $request)
    {
        global $post;

        $this->postId = $request->request->getInt('postId', null);
        $this->isFrontend = $request->request->getBoolean('frontend', null);
        $this->isSubmodule = $request->request->getBoolean('submodule', null);

        $post = get_post($this->postId);
        setup_postdata($post);

        $this->moduleArgs['class'] = $request->request->filter('class', null, FILTER_SANITIZE_STRING);

        $this->moduleArgs['postId'] = absint($this->postId);
        $this->moduleArgs['area'] = $request->request->filter('area', null, FILTER_SANITIZE_STRING);
        $this->moduleArgs['submodule'] = $this->isSubmodule;
        $this->moduleArgs['areaContext'] = $request->request->filter('areaContext', null, FILTER_SANITIZE_STRING);
        $this->moduleArgs['parentObjectId'] = absint($request->get('parentObjectId'));

        $this->moduleArgs['globalModule'] = $this->globalModule = $request->request->getBoolean(
            'globalModule',
            null
        );

        $this->parentObject = $request->request->get('parentObject');
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
        $this->moduleArgs = apply_filters('kb.intercept.creation.args', $this->moduleArgs);
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

        $addArgs = $this->request->request->get('renderSettings');

        if (is_null($addArgs)) {
            $addArgs = array();
        }

//        $renderSettings = new AreaRenderSettings($addArgs, $this->area);

        $module = apply_filters('kb.module.before.factory', $this->newModule);
        if ($this->isFrontend) {
            $moduleRenderSettings = new ModuleRenderSettings(array('moduleElement'), $module->properties);
            $singleRenderer = new SingleModuleRenderer($module, $moduleRenderSettings);
            $html = $singleRenderer->render();
        } else {
            $html = $module->renderForm();
        }
        $response = array
        (
            'id' => $this->newModule->getId(),
            'module' => $this->newModule->toJSON(),
            'name' => $this->newModule->properties->getSetting('name'),
            'json' => Kontentblocks::getService('utility.jsontransport')->getJSON(),
            'html' => $html
        );

        return new AjaxSuccessResponse('Module created', $response);

    }

}
