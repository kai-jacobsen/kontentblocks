<?php

namespace Kontentblocks\Ajax;


use Kontentblocks\Common\Data\ValueStorage;

class AjaxCallbackHandler
{

    protected $actions = array();

    protected $deleted = array();

    /**
     * Construct
     */
    public function __construct()
    {
        $this->setupCoreActions();
        add_action( 'init', array( $this, 'setupHooks' ), 20, 1 );
    }

    /**
     * @param string $action
     * @param mixed $callback
     * @return $this
     */
    public function registerAction( $action, $callback )
    {
        $this->actions[$action] = $callback;
        return $this;
    }

    public function actionExists( $action )
    {
        return isset( $this->actions[$action] );
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
                'resortModules' => array( '\Kontentblocks\Ajax\Actions\SortModules', 'run' ),
                'afterAreaChange' => array( '\Kontentblocks\Ajax\Actions\AfterAreaChange', 'run' ),
                'getRemoteEditor' => array( 'Kontentblocks\Ajax\Actions\RemoteGetEditor', 'run' )
            )
        );
    }

    /**
     * Setup core actions
     */
    private function setupCoreActions()
    {
        $actions = $this->getCoreActions();
        foreach ($actions as $action => $callback) {
            $this->registerAction( $action, $callback );
        }
    }

    public function setupHooks()
    {
        foreach ($this->actions as $action => $callback) {
            add_action(
                'wp_ajax_' . $action,
                function () use ( $callback ) {
                    if ($this->verify( $callback )) {
                        call_user_func( $callback, new ValueStorage( $_POST ) );
                    }
                }
            );
        }
    }

    private function verify( $callback )
    {

        if (!property_exists( $callback[0], 'nonce' )) {
            return new AjaxErrorResponse( 'static nonce property not set on class' );
        }
        $nonce = $callback[0]::$nonce;
        $check = check_ajax_referer( $nonce, null, false );

        if (!$check) {
            return new AjaxErrorResponse( 'Nonce verification failed', array( 'nonce' => $nonce, 'check' => $check ) );
        }

        return true;
    }

}