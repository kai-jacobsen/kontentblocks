<?php

Class KB_Meta_Box
{

    /**
     * Stores the current post type
     * @var string  
     */
    private $_post_type = '';

    /**
     * Id of current post
     */
    public $post_id;

    /**
     * Stores the current page template, if available
     * @var string
     */
    private $_page_template = '';

    /**
     * Settings saved for the areas on this post
     * @var array 
     */
    private $_saved_area_settings = array( );

    /**
     * Blocks associated with this post
     * @var array 
     */
    private $_postblocks = array( );

    /**
     * Areas used on this post 
     */
    public $areas = array( );

    /**
     * Filtered Blocks / assigned to areas 
     */
    public $filtered_blocks = array( );

    /**
     * default context layout 
     */
    private $context_layout = array( );

    /**
     * Add the main metabox to all given post types in the kb_register_kontentblocks function call
     * 
     */
    function __construct( $manager )
    {
        $this->manager = $manager;

        $this->init();


        $this->context_layout = array(
            'top' => array(
                'id' => 'top',
                'title' => __( 'Page header', 'kontentblocks' ),
                'description' => __( 'Full width area at the top of this page', 'kontentblocks' )
            ),
            'normal' => array(
                'id' => 'normal',
                'title' => __( 'Content', 'kontentblocks' ),
                'description' => __( 'Main content column of this page', 'kontentblocks' )
            ),
            'side' => array(
                'id' => 'side',
                'title' => __( 'Page Sidebar', 'kontentblocks' ),
                'description' => __( 'Sidebar of this page', 'kontentblocks' )
            ),
            'bottom' => array(
                'id' => 'bottom',
                'title' => __( 'Footer', 'kontentblocks' ),
                'description' => __( 'Full width area at the bottom of this page', 'kontentblocks' )
            )
        );

        // plugins may change this
        $this->context_layout = apply_filters( 'kb_default_context_layout', $this->context_layout );

    }

    function init()
    {
        global $pagenow, $post;

        if ( $pagenow == 'nav-menus.php' )
            return;



        add_action( 'add_meta_boxes', array( $this, '_prepare_post_data' ), 10 );
        add_action( 'add_meta_boxes', array( $this, '_add_ui' ), 20, 2 );
        add_action( 'save_post', array( $this, 'save' ), 10, 2 );
        add_action( 'admin_footer', array( $this, 'toJSON' ), 1 );
        add_action( 'admin_footer', array( $this, 'copymove_modal' ) );

    }

    /**
     * setup post specific data used throughout the script
     * @global object $post 
     */
    public function _prepare_post_data()
    {
        global $post, $Kontentblocks;

        $this->_postmeta = $this->_get_post_custom( $post->ID );

        // current post blocks
        $this->_postblocks = $this->manager->_setup_blocks( get_post_meta( $post->ID, 'kb_kontentblocks', true ) );

        // current post area settings
        $this->_saved_area_settings = get_post_meta( $post->ID, 'kb_area_settings', true );

        // current post type
        $this->_post_type = get_post_type( $post->ID );

        // current post page template
        $this->_page_template = get_post_meta( $post->ID, '_wp_page_template', true );

        /* if (empty($this->_page_template) && $this->_post_type == 'page')
          {
          $this->_page_template = 'default';
          } */

        // find available areas for this post type / page template
        $this->areas = $this->_find_available_areas( $this->manager->get_areas() );

    }

    /*
     * Get all custom data to save some queries
     */

    public function _get_post_custom( $id )
    {
        $meta = array_map( array( $this, 'maybe_unserialize_recursive' ), get_post_custom( $id ) );
        return $meta;

    }

    public function maybe_unserialize_recursive( $input )
    {
        return maybe_unserialize( $input[ 0 ] );

    }

    /**
     * Add main Metabox to specified post types / page templates
     * 
     */
    function _add_ui( $post_type, $post )
    {
        $this->post_id = $post->ID;
        add_action( 'edit_form_after_editor', array( $this, 'ui' ), 10 );

    }

    /**
     * Renders the main metabox.
     * Calls block method on each block to create the actual form fields
     * 
     * @global object Kontentblocks
     * TODO: support for Kontentblocks specific caps
     */
    function ui()
    {

        echo "<div class='clearfix' id='kontentblocks_stage'>";

        // Use nonce for verification
        wp_nonce_field( plugin_basename( __FILE__ ), 'kb_noncename' );
        wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );

        // output hidden input field and set the base_id as reference for new blocks
        // this makes sure that new blocks have a unique id
        $this->_base_id_field();

        // hackish way to keep functionality of dynamically create tinymce instances
        if ( !post_type_supports( $this->_post_type, 'editor' ) and !post_type_supports( $this->_post_type, 'kb_content' ) ) {


            echo "<div style='display: none;'>";
            wp_editor( '', 'content' );
            echo '</div>';
        }

        $this->filtered_blocks = self::filter_blocks( $this->_postblocks );


        foreach ( $this->context_layout as $context ) {
            $this->do_context( $context );
        }

        echo "</div> <!--end ks -->";

    }

    /**
     * Calls save mthod on each Block
     * 
     * @global object Kontentblocks
     */
    function save( $post_id, $post_object )
    {
        global $Kontentblocks, $lcMobile;


        // verify if this is an auto save routine. 
        // If it is our form has not been submitted, so we dont want to do anything
        if ( empty( $_POST ) )
            return;
        if ( empty( $_POST[ 'kb_noncename' ] ) )
            return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
            return;

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if ( !empty( $_POST ) ) {
            if ( !wp_verify_nonce( $_POST[ 'kb_noncename' ], plugin_basename( __FILE__ ) ) )
                return;
        }

        // Check permissions
        if ( 'page' == $_POST[ 'post_type' ] ) {
            if ( !current_user_can( 'edit_page', $post_id ) )
                return;
        }
        else {
            if ( !current_user_can( 'edit_post', $post_id ) )
                return;
        }

        if ( !current_user_can( 'edit_kontentblocks' ) ) {
            return;
        }

        if ( $post_object->post_type == 'revision' && !isset($_POST['wp-preview']) ) {
            return;
        }


        
        $real_post_id = isset( $_POST[ 'post_ID' ] ) ? $_POST[ 'post_ID' ] : NULL;

        $this->_postmeta = $this->_get_post_custom( $real_post_id );

        // calls the save function for every block
        $kb_blocks = (!empty( $this->_postmeta[ 'kb_kontentblocks' ] )) ? $this->_postmeta[ 'kb_kontentblocks' ] : '';

        // Backup data, not for Previews
        if (!isset($_POST['wp_preview'])){
            $Meta = new KB_Post_Meta( $real_post_id );
            $Meta->backup( 'Before regular update' );
        }

        if ( !empty( $kb_blocks ) ) {
            foreach ( $kb_blocks as $block ) {

                if ( !class_exists( $block[ 'class' ] ) )
                    continue;

                //hack 
                $id     = null;
                $tosave = array( );

                $instance          = $this->manager->blocks[ $block[ 'class' ] ];
                $instance->post_id = $real_post_id;

                // new data from $_POST
                $data = (!empty( $_POST[ $block[ 'instance_id' ] ] )) ? $_POST[ $block[ 'instance_id' ] ] : null;

                // old, saved data
                $old = $this->_postmeta[ '_' . $block[ 'instance_id' ] ];



                // check for draft and set to false
                $block[ 'draft' ] = self::_draft_check( $block );

                // special block specific data
                $block = self::_individual_block_data( $block, $data );


                $updateblocks[ $block[ 'instance_id' ] ] = $block;


                // call save method on block
                // if locking of blocks is used, and a block is locked, use old data
                if ( KONTENTLOCK && $block[ 'locked' ] == 'locked' or $data == null ) {
                    $new = $old;
                }
                else {
                    $new = $instance->save( $old, $id, $data );
                    $new = apply_filters( 'modify_block_data', $new );
                }


                // store new data in post meta
                if ( $new && $new != $old ) {
                    if ( $_POST[ 'wp-preview' ]  === 'dopreview') {
                        update_post_meta( $real_post_id, '_preview_' . $block[ 'instance_id' ], $new );
                    }
                    // if this is a preview, save temporary data for previews
                    // save real data
                    else {
                        update_post_meta( $real_post_id, '_' . $block[ 'instance_id' ], $new );
                        delete_post_meta( $real_post_id, '_preview_' . $block[ 'instance_id' ] );
                    }

                    // delete transient on update
                    delete_transient( $block[ 'instance_id' ] );
                }
            }
            update_post_meta( $real_post_id, 'kb_kontentblocks', $updateblocks );
        }

        // save area settings which are specific to this post (ID-wise)
        if ( !empty( $this->manager->areas ) ) {

            if ( $lcMobile && $lcMobile === true )
                ;
            return;

            foreach ( $Kontentblocks->get_areas() as $k => $v ) {
                $tosave[ $k ] = KBArea::save_custom_area_settings( $k );
            }

            update_post_meta( $real_post_id, 'kb_area_settings', $tosave );
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
     * Filter areas which are available on this specific post	 * 
     * 
     * @global object $Kontentblocks
     * @return array 
     */
    public function _find_available_areas( $areas_src = null, $sort_context = true )
    {

        if ( false !== strpos( $this->_page_template, 'redirect' ) )
            return false;

        //declare var
        $areas = array( );

        $post_type     = $this->_post_type;
        $page_template = $this->_page_template;


        // loop through areas and find all which are attached to this post type and/or page template
        foreach ( $areas_src as $area ) {


            if ( empty( $area[ 'context' ] ) )
                $area[ 'context' ] = 'side';



            if ( (!empty( $area[ 'page_template' ] ) ) && (!empty( $area[ 'post_type' ] )) ) {
                if ( in_array( $page_template, $area[ 'page_template' ] ) && in_array( $post_type, $area[ 'post_type' ] ) ) {
                    $areas[ ] = $area;
                }
            }
            elseif ( !empty( $area[ 'page_template' ] ) ) {
                if ( in_array( $page_template, $area[ 'page_template' ] ) ) {

                    $areas[ ] = $area;
                }
            }
            elseif ( !empty( $area[ 'post_type' ] ) ) {
                if ( in_array( $post_type, $area[ 'post_type' ] ) ) {
                    $areas[ ] = $area;
                }
            }
        };

        $sareas = self::orderBy( $areas, 'order' );

        if ( $sort_context )
            $sareas = self::assign_context( $sareas );
        return $sareas;

    }

    private static function orderBy( $data, $field )
    {
        $code = "return strnatcmp(\$a['$field'], \$b['$field']);";
        usort( $data, create_function( '$a,$b', $code ) );
        return $data;

    }

    private static function assign_context( $areas )
    {
        if ( !$areas )
            return __return_empty_array();

        foreach ( $areas as $area ) {
            $contextfy[ $area[ 'context' ] ][ ] = $area;
        }

        return $contextfy;

    }

    public static function filter_blocks( $blocks )
    {
        $sorted_blocks = array( );

        if ( is_array( $blocks ) ) {
            foreach ( $blocks as $block ) {
                $area_id = $block->area;

                $sorted_blocks[ $area_id ][ ] = $block;
            }
            return $sorted_blocks;
        }

    }

    /**
     * Render each context if areas are available
     * 
     * @param array $context 
     */
    public function do_context( $context )
    {
        // check for side area
        $side = (!empty( $this->areas[ 'side' ] )) ? 'has-sidebar' : 'no-sidebar';

        if ( !empty( $this->areas[ $context[ 'id' ] ] ) ) {

            echo "<div id='context_{$context[ 'id' ]}' class='area-{$context[ 'id' ]} {$side}'>
				<div class='context-inner area-holder context-box'>
				<div class='context-header'>
					<h2>{$context[ 'title' ]}</h2>
					<p class='description'>{$context[ 'description' ]}</p>
				</div>
				";


            foreach ( $this->areas[ $context[ 'id' ] ] as $list ) {
                // exclude dynamic areas
                if ( $list[ 'dynamic' ] )
                    continue;
                echo "<div class='area-wrap clearfix cf'>";
                // Setup new Area

                $area                      = new KBArea( $list );
                $area->saved_area_settings = $this->_saved_area_settings;
                $area->blocks              = (!empty( $this->filtered_blocks[ $list[ 'id' ] ] ) ) ? $this->filtered_blocks[ $list[ 'id' ] ] : array( );
                $area->set_context( $context[ 'id' ] );
                $area->set_page_template( $this->_page_template );
                $area->set_post_type( $this->_post_type );

                // do area header markup
                $area->_do_area_header();

                // render blocks for the area
                $area->do_area_blocks();
                echo "</div>";
            }

            echo "</div>"; // end inner
            // hook to add custom stuff after areas
            do_action( "context_box_{$context[ 'id' ]}", $context[ 'id' ] );

            echo "</div>";
        }
        else {
            // hook should happen, even if there are no areas available
            do_action( "context_box_{$context[ 'id' ]}", $context[ 'id' ] );
        }

    }

    /**
     * Echos a hidden input field with the base_id
     * Helper Function
     */
    private function _base_id_field()
    {
        // prepare base id for new blocks
        if ( !empty( $this->_postblocks ) ) {
            $base_id = $this->_get_highest_id( $this->_postblocks );
        }
        else {
            $base_id = 0;
        }

        // add a hidden field to the meta box, javascript will use this
        echo '<input type="hidden" id="kb_all_blocks" value="' . $base_id . '" />';

    }

    /**
     * get base id for new blocks
     * extracts the attached number of every block and returns the highest number found
     *
     * @param int
     */
    public function _get_highest_id( $blocks )
    {
        $collect = '';
        if ( !empty( $blocks ) ) {
            foreach ( $blocks as $block ) {
                $block     = maybe_unserialize( $block );
                $count     = strrchr( $block->instance_id, "_" );
                $id        = str_replace( '_', '', $count );
                $collect[ ] = $id;
            }
        }

        return max( $collect );

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
        $toJSON = array(
            'areas' => $this->areas,
            'page_template' => $this->_page_template,
            'post_type' => $this->_post_type,
            'post_id' => $this->post_id
        );

        echo "<script> var kbpage =" . json_encode( $toJSON ) . "</script>";

    }

}