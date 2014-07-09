<?php

namespace Kontentblocks\Backend\Screen;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Fields\Definitions\DateTime;
use Kontentblocks\Helper;
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
     * Post data Handler
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    protected $Environment;

    /**
     * Add the main metabox to all given post types in the kb_register_kontentblocks function call
     */
    function __construct()
    {
        global $pagenow;
        $this->hooks = $this->setupHooks();

        if (!in_array( $pagenow, $this->hooks )) {
            return null;
        }

        // prepare current posts data
        add_action( 'add_meta_boxes', array( $this, 'setupEnvironment' ), 10 );
        // add UI
        add_action( 'add_meta_boxes', array( $this, 'addUserInterface' ), 20, 2 );
        // register save callback
        add_action( 'save_post', array( $this, 'save' ), 10, 2 );
        // expose data to the document
        add_action( 'admin_footer', array( $this, 'toJSON' ), 1 );

    }

    /**
     * setup post specific data used throughout the script
     * @global \WP_Post $post
     * @uses \Kontentblocks\Backend\Environment\PostEnvironment
     * @since 1.0.0
     */
    public function setupEnvironment()
    {
        global $post;
        $this->Environment = new PostEnvironment( $post->ID );

    }

    /**
     * main hook to add the interface
     * @since 1.0.0
     *
     */
    function addUserInterface()
    {
        add_action( 'edit_form_after_editor', array( $this, 'userInterface' ), 10 );
    }

    /**
     * User Interface
     * Prepares the outer html
     * Adds some generic but important meta informations in hidden fields
     * calls renderScreen
     * @since 1.0.0
     * @return void
     */
    function userInterface()
    {


        // bail if post type doesn't support kontentblocks
        if (!post_type_supports( $this->Environment->get( 'postType' ), 'kontentblocks' )) {
            return;
        }
        // the main wrapper for the interface
        echo "<div class='clearfix' id='kontentblocks_stage'>";
        echo "<div class='kb-whiteout' style='display: none;'></div>";
        echo "<div class='fullscreen--title-wrapper' style='display: none;'></div>";
        echo "<div class='fullscreen--description-wrapper' style='display: none;'></div>";
        // Use nonce for verification
        wp_nonce_field( 'kontentblocks_save_post', 'kb_noncename' );
        wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );

        // output hidden input field and set the base_id as reference for new modules
        // this makes sure that new modules have a unique id
        echo Utilities::getBaseIdField( $this->Environment->getAllModules() );

        // hackish way to keep functionality of dynamically create tinymce instances
        if (!post_type_supports(
                $this->Environment->get( 'postType' ),
                'editor'
            ) and !post_type_supports( $this->Environment->get( 'postType' ), 'kb_content' )
        ) {
            Utilities::hiddenEditor();
        }

        // tada
        $this->renderScreen();

        echo "</div> <!--end ks -->";


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

        $Environment = new PostEnvironment( $post_id );
        $Environment->save();

    }

    # ------------------------------------------------
    # Helper methods
    #-------------------------------------------------


    /**
     * Render
     * Create a new Screen Manager which will handle the several sections
     * True edit screen layout starts here
     * @uses Kontentblocks\Backend\Screen\ScreenManager
     * @return void
     * @since 1.0.0
     *
     */
    public function renderScreen()
    {
        if (( $this->Environment->get( 'areas' ) === false )) {
            return;
        }
        $ScreenManager = new ScreenManager( $this->Environment );
        $ScreenManager->render();

    }

    /**
     * toJSON
     * Make certain properties available throughout the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {
        global $post;
        $toJSON = array(
            'page_template' => $this->Environment->get( 'pageTemplate' ),
            'post_type'     => $this->Environment->get( 'postType' ),
            'post_id'       => $post->ID
        );
        echo "<script> var KB = KB || {}; KB.Screen =" . json_encode( $toJSON ) . "</script>";

    }

    /**
     * Setup default whitelist of allowed wp backend page hooks
     * @since 1.0.0
     * @return array
     * @filter kb_page_hooks modify allowed page hooks
     */
    private function setupHooks()
    {
        return apply_filters( 'kb::setup.hooks', array( 'post.php', 'post-new.php' ) );

    }

}
