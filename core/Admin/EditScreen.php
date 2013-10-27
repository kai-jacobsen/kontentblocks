<?php

namespace Kontentblocks\Admin;

use Kontentblocks\Kontentblocks,
    Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Admin\ScreenManager,
    Kontentblocks\Utils\MetaData,
    Kontentblocks\Helper;

/**
 * Purpose: Creates the UI for the registered post type, which is just page by default
 * Removes default meta boxes and adds the custom ui
 * Handles saving of areas while in post context
 * 
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
        $this->hooks   = array( 'post.php', 'post-new.php' );
        $this->manager = Kontentblocks::getInstance();
        global $pagenow;

        if ( !in_array( $pagenow, $this->hooks ) ) {
            return null;
        }

        add_action( 'add_meta_boxes', array( $this, 'preparePostData' ), 10 );
        add_action( 'add_meta_boxes', array( $this, 'addUserInterface' ), 20, 2 );
        add_action( 'save_post', array( $this, 'save' ), 10, 2 );
        add_action( 'admin_footer', array( $this, 'toJSON' ), 1 );
        add_action( 'admin_footer', array( $this, 'copymove_modal' ) );

    }

    /**
     * setup post specific data used throughout the script
     * @global object $post 
     */
    public function preparePostData()
    {
        global $post;
        $this->postData = new PostDataContainer( $post->ID );

    }

    /**
     * Add main Metabox to specified post types / page templates
     * 
     */
    function addUserInterface()
    {
        add_action( 'edit_form_after_editor', array( $this, 'userInterface' ), 10 );

    }

    /**
     * Renders the stage.
     * 
     */
    function userInterface()
    {

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

        $this->renderScreen();

        echo "</div> <!--end ks -->";

    }

    /**
     * Calls save mthod on each Module
     * 
     * TODO: Outsource saving routine
     * @global object Kontentblocks
     */
    function save( $post_id, $post_object )
    {

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
        $MetaData = new MetaData( $real_post_id );

        // Backup data, not for Previews
        if ( !isset( $_POST[ 'wp_preview' ] ) ) {
            $MetaData->backup( 'Before regular update' );
        }

        
        if ( !empty( $MetaData->getIndex() ) ) {
            foreach ( $MetaData->getIndex() as $module ) {

                if ( !class_exists( $module[ 'class' ] ) ) {
                    continue;
                }

                //hack 
                $id     = null;
                $tosave = array();

                // new data from $_POST
                //TODO: filter incoming data
                $data = (!empty( $_POST[ $module[ 'instance_id' ] ] )) ? $_POST[ $module[ 'instance_id' ] ] : null;
                $old = $MetaData->getMetaData( $module[ 'instance_id' ] );

                $Factory           = new ModuleFactory( $module );
                $instance          = $Factory->getModule();
                $instance->post_id = $real_post_id;

                // old, saved data
                //TODO
                $instance->new_instance = $old;

                // check for draft and set to false
                // TODO: Lame
                $module[ 'draft' ] = self::_draft_check( $module );

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
                    $new = $instance->save( $data );
                    $new = apply_filters( 'modify_block_data', $new );
                }


                // store new data in post meta
                // if this is a preview, save temporary data for previews
                if ( $new && $new != $old ) {
                    if ( $_POST[ 'wp-preview' ] === 'dopreview' ) {
                        update_post_meta( $real_post_id, '_preview_' . $module[ 'instance_id' ], $new );
                    }
                    // save real data
                    else {
                        $MetaData->saveModule($module['instance_id'], $new);
                        delete_post_meta( $real_post_id, '_preview_' . $module[ 'instance_id' ] );
                    }
                }
            }
            $MetaData->saveIndex( $updateblocks );
        }

        // save area settings which are specific to this post (ID-wise)
        if ( !empty( $_POST[ 'areas' ] ) ) {

            $collection = $MetaData->getMetaData( 'kb_area_settings' );
            foreach ( $_POST[ 'areas' ] as $id ) {

                if ( isset( $_POST[ $id ] ) ) {
                    $collection[ $id ] = $_POST[ $id ];
                }
            }
            $MetaData->saveMetaData( 'kb_area_settings', $collection );
        }

    }

    # ------------------------------------------------
    # Helper methods
    #-------------------------------------------------

    /**
     *
     * @param array $block
     * @param array $data
     * @return array 
     */
    public static function _individual_block_data( $block, $data )
    {
        $block[ 'name' ] = (!empty( $data[ 'block_title' ] )) ? $data[ 'block_title' ] : $block[ 'name' ];

        if ( !empty( $data[ 'area_context' ] ) )
            $block[ 'area_context' ] = $data[ 'area_context' ];

        $block = apply_filters( "kb_additional_block_data_{$block[ 'id' ]}", $block, $data );

        return $block;

    }

    /**
     * Checks if block is in draft mode and if so publish it by setting 'draft' to false
     * @param array $block
     * @return string 
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
     * Create a new Screen Manager which will handle the several sections
     * True edit screen layout starts here
     * 
     */
    public function renderScreen()
    {
        $ScreenManager = new ScreenManager( $this->postData );
        $ScreenManager->render();

    }

    /*
     * Markup for the block action copymove
     * 
     * Gets filled by Ajax
     */

    public function copymove_modal()
    {
        echo "<div id='kb-copymove' class='reveal-modal small copymove'></div>\n";

    }

    public function toJSON()
    {
        global $post;
        $toJSON = array(
            'areas' => $this->postData->get( 'areas' ),
            'page_template' => $this->postData->get( 'pageTemplate' ),
            'post_type' => $this->postData->get( 'postType' ),
            'post_id' => $post->ID
        );

        echo "<script> var kbpage =" . json_encode( $toJSON ) . "</script>";

    }

}
