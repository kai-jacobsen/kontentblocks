<?php

namespace Kontentblocks\Ajax;

use Symfony\Component\HttpFoundation\Request;


/**
 * Class AjaxCallbackHandler
 * @package Kontentblocks\Ajax
 *
 * internal ajax action mapper
 * maps actions to corresponding classe with fqn
 */
class AjaxCallbackHandler
{

    /**
     * registered actions
     * @var array
     */
    protected $actions = array();

    /**
     * removed actions
     * @var array
     */
    protected $removed = array();

    /**
     * Construct
     */
    public function __construct()
    {
        $this->setupCoreActions();
        add_action('init', array($this, 'setupHooks'), 20, 1);
    }

    /**
     * Setup core actions
     */
    private function setupCoreActions()
    {
        $actions = $this->getCoreActions();
        foreach ($actions as $action => $callback) {
            $this->registerAction($action, $callback);
        }
    }

    /**
     * Core Actions
     *
     * @uses filter kb.ajax.core.actions
     * @return mixed|void
     */
    private function getCoreActions()
    {
        return apply_filters(
            'kb.ajax.core.actions',
            array(
                'resortModules' => array('\Kontentblocks\Ajax\Actions\SortModules', 'run'),
                'afterAreaChange' => array('\Kontentblocks\Ajax\Actions\AfterAreaChange', 'run'),
                'getRemoteEditor' => array('Kontentblocks\Ajax\Actions\RemoteGetEditor', 'run'),
                'changeArea' => array('Kontentblocks\Ajax\Actions\ChangeArea', 'run'),
                'undraftModule' => array('Kontentblocks\Ajax\Actions\UndraftModule', 'run'),
                'applyContentFilter' => array('Kontentblocks\Ajax\Actions\Frontend\ApplyContentFilter', 'run'),
                'removeModules' => array('Kontentblocks\Ajax\Actions\RemoveModules', 'run'),
                'batchRemoveModules' => array('Kontentblocks\Ajax\Actions\BatchRemoveModules', 'run'),
                'changeModuleStatus' => array('Kontentblocks\Ajax\Actions\ChangeModuleStatus', 'run'),
                'getSanitizedId' => array('Kontentblocks\Ajax\Actions\GetSanitizedId', 'run'),
                'duplicateModule' => array('Kontentblocks\Ajax\Actions\DuplicateModule', 'run'),
                'updateModuleData' => array('Kontentblocks\Ajax\Actions\UpdateModuleData', 'run'),
                'createNewModule' => array('Kontentblocks\Ajax\Actions\CreateNewModule', 'run'),
                'getModuleForm' => array('Kontentblocks\Ajax\Actions\Frontend\GetModuleForm', 'run'),
                'updateModule' => array('Kontentblocks\Ajax\Actions\Frontend\UpdateModule', 'run'),
                'fieldGetImage' => array('Kontentblocks\Ajax\Actions\Frontend\FieldGetImage', 'run'),
                'getOptionPanelForm' => array('Kontentblocks\Ajax\Actions\Frontend\GetOptionPanelForm', 'run'),
                'getStaticPanelForm' => array('Kontentblocks\Ajax\Actions\Frontend\GetStaticPanelForm', 'run'),
                'saveOptionPanelForm' => array('Kontentblocks\Ajax\Actions\Frontend\SaveOptionPanelForm', 'run'),
                'saveStaticPanelForm' => array('Kontentblocks\Ajax\Actions\Frontend\SaveStaticPanelForm', 'run'),
                'syncAreaSettings' => array('Kontentblocks\Ajax\Actions\SyncAreaSettings', 'run'),
                'getGlobalAreaHTML' => array('Kontentblocks\Ajax\Actions\GetGlobalAreaHTML', 'run'),
                'updateContextAreaOrder' => array('Kontentblocks\Ajax\Actions\UpdateContextAreaOrder', 'run'),
                'updatePostPanel' => array('Kontentblocks\Ajax\Actions\Frontend\UpdatePostPanel', 'run'),
                'getPostObjects' => array('Kontentblocks\Ajax\Actions\GetPostObjects', 'run'),
                'handleClipboard' => array('Kontentblocks\Ajax\Actions\HandleClipboard', 'run'),
                'getModuleBackendForm' => array('Kontentblocks\Ajax\Actions\GetModuleBackendForm', 'run'),
                'updateFieldModel' => array('Kontentblocks\Ajax\Actions\Frontend\UpdateFieldModel', 'run'),
                'getOembed' => array('Kontentblocks\Ajax\Actions\GetOembed', 'run'),
                'cropImage' => array('Kontentblocks\Ajax\Actions\CropImage', 'run')

            )
        );
    }

    /**
     * @param string $action
     * @param mixed $callback
     * @return $this
     */
    public function registerAction($action, $callback)
    {
        $this->actions[$action] = $callback;
        return $this;
    }

    /**
     * @param $action
     * @return bool
     */
    public function actionExists($action)
    {
        return isset($this->actions[$action]);
    }

    /**
     * setup core hooks
     */
    public function setupHooks()
    {
        foreach ($this->actions as $action => $callback) {
            add_action(
                'wp_ajax_' . $action,
                function () use ($callback) {
                    if ($this->verify($callback)) {
                        call_user_func($callback, Request::createFromGlobals());
                    }
                }
            );
        }
    }

    /**
     * @param $callback
     * @return bool|AjaxErrorResponse
     */
    private function verify($callback)
    {

        if (!self::canRun()) {
            new AjaxErrorResponse('permission denied');
            return false;
        }

        if (!property_exists($callback[0], 'nonce')) {
            new AjaxErrorResponse('static nonce property not set on class');
            return false;
        }
        $nonce = $callback[0]::$nonce;
        $check = check_ajax_referer($nonce, null, false);

        if (!$check) {
            new AjaxErrorResponse('Nonce verification failed', array('nonce' => $nonce, 'check' => $check));
            return false;
        }

        return true;
    }

    public static function canRun()
    {
        if (!is_user_logged_in()) {
            new AjaxErrorResponse('Log in if you can!');
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            new AjaxErrorResponse('insufficient permissions');
            return false;
        }

        if (!current_user_can('edit_posts')) {
            new AjaxErrorResponse('insufficient permissions');
            return false;
        }

        return true;
    }

}