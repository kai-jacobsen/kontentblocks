<?php

namespace Kontentblocks\Admin\Post;

use Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Admin\Post\ScreenManager,
    Kontentblocks\Helper;

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
     * @uses \Kontentblocks\Admin\Post\PostEnvironment
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
        wp_nonce_field( plugin_basename( __FILE__ ), 'kb_noncename' );
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
     * @todo Split up or outsource in own class,
     * @param int $post_id The current post id
     * @param \WP_Post $post_object Post object
     * @since 1.0.0
     */
    function save( $post_id, $post_object )
    {

        $savedData = null;
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if ( empty( $_POST ) ) {
            return;
        }

        if ( empty( $_POST[ 'kb_noncename' ] ) ) {
            return;
        }

        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if ( !empty( $_POST ) ) {
            if ( !wp_verify_nonce( $_POST[ 'kb_noncename' ], plugin_basename( __FILE__ ) ) ) {
                return;
            }
        }

        // Check permissions
        if ( 'page' == $_POST[ 'post_type' ] ) {
            if ( !current_user_can( 'edit_page', $post_id ) ) {
                return;
            }
        }
        else {
            if ( !current_user_can( 'edit_post', $post_id ) ) {

                return;
            }
        }

        if ( !current_user_can( 'edit_kontentblocks' ) ) {
            return;
        }

        if ( $post_object->post_type == 'revision' && !isset( $_POST[ 'wp-preview' ] ) ) {
            return;
        }

        $real_post_id = isset( $_POST[ 'post_ID' ] ) ? $_POST[ 'post_ID' ] : NULL;

        // Intantiate Postmeta data handler
        $Environment = \Kontentblocks\Helper\getEnvironment( $real_post_id );

        // Backup data, not for Previews
        if ( !isset( $_POST[ 'wp_preview' ] ) ) {
            $Environment->getDataHandler()->backup( 'Before regular update' );
        }


        if ( !empty( $Environment->getDataHandler()->getIndex() ) ) {
            foreach ( $Environment->getDataHandler()->getIndex() as $module ) {

                if ( !class_exists( $module[ 'class' ] ) ) {
                    continue;
                }

                //hack
                $id = null;

                // new data from $_POST
                //TODO: filter incoming data
                $data = (!empty( $_POST[ $module[ 'instance_id' ] ] )) ? $_POST[ $module[ 'instance_id' ] ] : null;
                $old  = $Environment->getDataHandler()->getModuleData( $module[ 'instance_id' ] );

                $Factory              = new ModuleFactory( $module[ 'class' ], $module, $Environment );
                $instance             = $Factory->getModule();
                $instance->post_id    = $real_post_id;
                // old, saved data
                //TODO
                $instance->moduleData = $old;

                // check for draft and set to false
                // TODO: Lame
                $module[ 'state' ][ 'draft' ] = FALSE;

                // special block specific data
                $module = self::_individual_block_data( $module, $data );

                $module = apply_filters( 'save_module_data', $module, $data );

                // create updated index
                $updateblocks[ $module[ 'instance_id' ] ] = $module;

                // call save method on block
                // if locking of blocks is used, and a block is locked, use old data
                if ( KONTENTLOCK && $module[ 'locked' ] == 'locked' or $data === null ) {
                    $new = $old;
                }
                else {
                    $new = $instance->save( $data, $old );
                    $new = apply_filters( 'modify_block_data', $new );

                    $savedData = Helper\arrayMergeRecursiveAsItShouldBe( $new, $old );
                }


                // store new data in post meta
                // if this is a preview, save temporary data for previews
                if ( $savedData && $savedData != $old ) {
                    if ( $_POST[ 'wp-preview' ] === 'dopreview' ) {
                        update_post_meta( $real_post_id, '_preview_' . $module[ 'instance_id' ], $savedData );
                    }
                    // save real data
                    else {
                        $Environment->getDataHandler()->saveModule( $module[ 'instance_id' ], $savedData );
                        delete_post_meta( $real_post_id, '_preview_' . $module[ 'instance_id' ] );
                    }
                }
            }

            $Environment->getDataHandler()->saveIndex( $updateblocks );
        }

        // save area settings which are specific to this post (ID-wise)
        if ( !empty( $_POST[ 'areas' ] ) ) {

            $collection = $Environment->getDataHandler()->getMetaData( 'kb_area_settings' );
            foreach ( $_POST[ 'areas' ] as $id ) {

                if ( isset( $_POST[ $id ] ) ) {
                    $collection[ $id ] = $_POST[ $id ];
                }
            }
            $Environment->getDataHandler()->saveMetaData( 'kb_area_settings', $collection );
        }

    }

    # ------------------------------------------------
    # Helper methods
    #-------------------------------------------------

    /**
     * Save individual module data
     * Such as individiual module title
     * this data gets directly store on the module definition
     * @param array $block
     * @param array $data
     * @return array
     * @todo find usage and rename to ..._module_dat...
     */
    public static function _individual_block_data( $block, $data )
    {
        $block[ 'overrides' ][ 'name' ] = (!empty( $data[ 'block_title' ] )) ? $data[ 'block_title' ] : $block[ 'overrides' ][ 'name' ];

        return $block;

    }

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
     * @uses Kontentblocks\Admin\Post\ScreenManager
     * @return void
     * @since 1.0.0
     *
     */
    public function renderScreen()
    {

        if ( empty( $this->postData->get( 'areas' ) ) ) {
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
