<?php

namespace Kontentblocks\Ajax;


use Kontentblocks\Common\Data\PostInputData;

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
                'resortModules' => array( '\Kontentblocks\Ajax\Actions\SortModules', 'run' )
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
                    call_user_func( $callback, new PostInputData() );
                }
            );
        }
    }


}