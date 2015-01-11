<?php

namespace Kontentblocks\Backend\Screen;

use Kontentblocks\Helper;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\Utilities;

/**
 * Edit Screen (Post Edit Screen)
 * Purpose: Creates the UI for the registered post type, which is just 'page' by default
 * Removes default meta boxes and adds the custom ui
 * Handles saving of areas while in post context
 * @package Kontentblocks
 * @subpackage Post
 * @since 1.0.0
 */
Class EditScreen
{

    /**
     * Whitelist of hooks
     * @var array
     */
    protected $hooks;


    /**
     * Add the main metabox to all given post types in the kb_register_kontentblocks function call
     */
    function __construct()
    {
        global $pagenow;
        if (in_array( $pagenow, $this->setupHooks() )) {
            // add UI
            add_action( 'edit_form_after_editor', array( $this, 'renderUserInterface' ), 10 );
            // register save callback
            add_action( 'save_post', array( $this, 'save' ), 10, 2 );
            // expose data to the document
            add_action( 'admin_footer', array( $this, 'toJSON' ), 1 );
        }
    }

    /**
     * Callback for 'edit_form_after_editor'
     * @param $post
     */
    public function renderUserInterface( $post )
    {
        echo $this->userInterface( $post );
        _K::info( 'user interfaced rendered for a post type' );
    }

    /**
     * User Interface
     * Prepares the outer html
     * Adds some generic but important meta informations in hidden fields
     * calls renderScreen
     * @since 1.0.0
     * @param $post
     * @return null
     */
    public function userInterface( $post )
    {
        $Environment = Utilities::getEnvironment( $post->ID );
        // bail if post type doesn't support kontentblocks
        if (!post_type_supports( $Environment->get( 'postType' ), 'kontentblocks' )) {
            return null;
        }
        if (!post_type_supports( $Environment->get( 'postType' ), 'editor' )) {
            Utilities::hiddenEditor();
        }

        $hasAreas = true;
        $areas = $Environment->get( 'areas' );
        if (!$areas || empty( $areas )) {
            $hasAreas = false;
        }

        $View = new CoreView(
            '/edit-screen/user-interface.twig', array(
                'ScreenManager' => new ScreenManager( $areas, $Environment ),
                'hasAreas' => $hasAreas,
                'noAreas' => $this->handleEmptyAreas(),
                'blogId' => get_current_blog_id(),
                'baseField' => Utilities::getBaseIdField( $Environment->getAllModules() ),
                'nonces' => array(
                    'save' => wp_nonce_field( 'kontentblocks_save_post', 'kb_noncename', true, false ),
                    'ajax' => wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce', true, false )
                )
            )
        );

        return $View->render( false );

    }

    /**
     * Handles the saving of modules and supplemental data
     *
     * @param int $post_id The current post id
     *
     * @return void
     * @since 1.0.0
     */
    function save( $post_id )
    {

        if (isset( $_POST['wp-preview'] ) && $_POST['wp-preview'] === 'dopreview') {
            $post_id = get_the_ID();
        }

        $Environment = Utilities::getEnvironment( $post_id );
        $Environment->save();
    }

    # ------------------------------------------------
    # Helper methods
    #-------------------------------------------------


    /**
     * toJSON
     * Make certain properties available throughout the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {
        Utilities::getEnvironment( get_the_ID() )->toJSON();
    }

    /**
     * Setup default whitelist of allowed wp backend page hooks
     * @since 1.0.0
     * @return array
     * @filter kb_page_hooks modify allowed page hooks
     */
    private function setupHooks()
    {
        return apply_filters( 'kb.setup.hooks', array( 'post.php', 'post-new.php' ) );

    }

    private function handleEmptyAreas()
    {
        if (current_user_can( 'manage_kontentblocks' )) {
            $tpl = new CoreView( 'no-areas.twig' );
            return $tpl->render( false );
        }
        return '';
    }

}
