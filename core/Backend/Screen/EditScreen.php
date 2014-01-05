<?php

namespace Kontentblocks\Backend\Screen;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Backend\Screen\ScreenManager,
    Kontentblocks\Helper;
use Kontentblocks\Backend\Storage\BackupManager;

/**
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
     * @var objext
     */
    protected $postData;

    /**
     * Add the main metabox to all given post types in the kb_register_kontentblocks function call
     *
     */
    function __construct()
    {
        global $pagenow;

        $this->hooks = $this->_setupPageHooks();

        if ( !in_array( $pagenow, $this->hooks ) ) {
            return null;
        }

        add_action( 'add_meta_boxes', array( $this, 'preparePostData' ), 10 );
        add_action( 'add_meta_boxes', array( $this, 'addUserInterface' ), 20, 2 );
        add_action( 'save_post', array( $this, 'save' ), 10, 2 );
        add_action( 'admin_footer', array( $this, 'toJSON' ), 1 );

    }

    /**
     * setup post specific data used throughout the script
     * @global \WP_Post $post
     * @uses \Kontentblocks\Backend\Environment\PostEnvironment
     * @since 1.0.0
     */
    public function preparePostData()
    {
        global $post;
        $this->postData = new PostEnvironment( $post->ID );

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
     */
    function userInterface()
    {

        // bail if post type doesn't support kontentblocks
        if ( !post_type_supports( $this->postData->get( 'postType' ), 'kontentblocks' ) ) {
            return false;
        }

        // the main wrapper for the interface
        echo "<div class='clearfix' id='kontentblocks_stage'>";

        // Use nonce for verification
        wp_nonce_field( 'kontentblocks_save_post', 'kb_noncename' );
        wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );

        // output hidden input field and set the base_id as reference for new modules
        // this makes sure that new modules have a unique id
        echo Helper\getbaseIdField( $this->postData->getAllModules() );

        // hackish way to keep functionality of dynamically create tinymce instances
        if ( !post_type_supports( $this->postData->get( 'postType' ), 'editor' ) and !post_type_supports( $this->postData->get( 'postType' ), 'kb_content' ) ) {
            Helper\getHiddenEditor();
        }

        // baaam
        $this->renderScreen();

        echo "</div> <!--end ks -->";

    }

    /**
     * Handles the saving of modules and supplemental data
     *
     * @todo Split up or outsource in own class (done, but optimize!)
     * @param int $post_id The current post id
     * @since 1.0.0
     */
    function save( $post_id )
    {
        $Environment = \Kontentblocks\Helper\getEnvironment( $post_id );
        $Environment->save();
        return;
    }

    # ------------------------------------------------
    # Helper methods
    #-------------------------------------------------


    /**
     * Checks if block is in draft mode and if so publish it by setting 'draft' to false
     * @param array $block
     * @return string
     * @todo Evaluate sense of this method
     * @since 1.0.0
     */
    public static function _draft_check( $block )
    {
        if ( !empty( $_POST[ 'wp-preview' ] ) )
            return $block[ 'draft' ];

        if ( 'true' === $block[ 'draft' ] ) {
            return 'false';
        }

    }

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

        if ( ( $this->postData->get( 'areas' ) === FALSE ) ) {
            return;
        }

        $ScreenManager = new ScreenManager( $this->postData );
        $ScreenManager->render();

    }

    /**
     * toJSON
     * Make certain properties available throught the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {
        global $post;
        $toJSON = array(
            'page_template' => $this->postData->get( 'pageTemplate' ),
            'post_type' => $this->postData->get( 'postType' ),
            'post_id' => $post->ID
        );
        echo "<script> var KB = KB || {}; KB.Screen =" . json_encode( $toJSON ) . "</script>";

    }

    /**
     * Setup default whitelist of allowed wp backend page hooks
     * @since 1.0.0
     * @return array
     * @filter kb_page_hooks modify allowed page hooks
     */
    private function _setupPageHooks()
    {
        return apply_filters( 'kb_page_hooks', array( 'post.php', 'post-new.php' ) );

    }

}
