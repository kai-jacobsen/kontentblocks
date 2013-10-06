<?php
namespace Kontentblocks\Modules;
use Kontentblocks\Utils\ImageObject,
    Kontentblocks\Utils\AreaDirectory;
/*
 * Structure
 * 
 * I. Properties
 * II. Costructor & Setup
 * III. Primary Block methods
 * IV. Backend Business Logic
 * V. Helper
 * VI. Addiotional Stuff
 */

class Module
{
    /* -----------------------------------------------------
     * I. Properties
     * -----------------------------------------------------
     */

    /**
     * Public Name of this Block
     * 
     * @var string 
     */
    var $name = '';

    /**
     * Internal generic identifier, for css classes etc
     * This is not specific to a single Block, it identifies the 'type' of the block
     * 
     * @var string 
     */
    var $id = '';

    /**
     * Settings for a Block as definied on construction
     * 
     * @var array
     */
    var $settings = array( );

    /**
     * Unique ID for a block, key of the post meta
     * Whenever you have to refer to a specific block, this is the id
     * 
     * @var string 
     */
    var $instance_id = null;

    /**
     * stolen from widgets concept, holds the new data from $_POST array
     * 
     * @var array 
     */
    var $new_instance = array( );

    /**
     * Hold draft status
     * 
     * New created blocks will be created as draft = true
     * @var bool  
     */
    var $draft = true;

    /**
     * Holds belonging area
     * 
     * @var string id of area 
     */
    var $area = 'kontentblocks';

    /**
     * Holds status 
     * 
     * @var string for some odd reason has to be kb_active or kb_inactive
     */
    var $active = 'kb_active';

    /**
     * Holds column count / identifier 
     * 
     * @var integer set by area templates
     */
    var $columns = null;

    /**
     * Area main context
     * set within render_blocks
     * 
     * @var string set by template tag 
     */
    var $context = '';

    /**
     * Area subcontext
     * set within render_blocks 
     * 
     * @var string set by template tag
     */
    var $subcontext = '';

    /**
     * current page template 
     * 
     * @var string plain filename of template file, no path
     */
    var $page_template = '';

    /**
     * current post type 
     * 
     * @var string
     */
    var $post_type = '';
    public $path;

    /**
     * II. Constructor
     * 
     * @param string $id identifier
     * @param string $name default name, can be individual overwritten
     * @param array $block_settings
     */
    function __construct( $id, $name, $block_settings = NULL )
    {
        $this->id       = $id;
        $this->name     = $name;
        $defaults       = array(
            'id' => $id,
            'disabled' => false,
            'public_name' => $this->name,
            'wrapper' => 'usewrapper',
            'before_block' => '<div id="%s" class="module ' . $this->id . ' %s">',
            'after_block' => '</div>',
            'description' => '',
            'connect' => null,
            'hidden' => false,
            'predefined' => false,
            'in_dynamic' => false,
            'cacheable' => true,
            'meta' => array()
        );
        $this->settings = wp_parse_args( $block_settings, $defaults );

        //connect this block to areas
        AreaDirectory::getInstance()->connect( get_class($this), $block_settings );

        $reflector = new \ReflectionClass( get_class( $this ) );
        $this->path        = dirname($reflector->getFileName());
        
    }

    /* -----------------------------------------------------
     * III. Primary Block methods
     * -----------------------------------------------------
     */

    /**
     * options()
     * Method for the backend display
     * has to be overwritten by each block
     * gets called by ui display callback
     *  
     */
    public function options( $data )
    {
        
    }

    /**
     * save()
     * Method to save whatever form fields are in the options() method
     * Gets called by the meta box save callback
     */
    public function save($a, $b, $c)
    {
        
    }

    /**
     * block()
     * Frontend display method.
     * Has no default output yet, and must be overwritten 
     */
    public function block($data)
    {
        
    }

    /**
     * setup()
     * Setup method gets called before block() is called
     * Used for enqueing scripts or print inline scripts
     * Kinda useless since there are other ways since 3.3 , but has to be verified before removed
     * There may be older blocks, which use this method
     */
    public function setup()
    {
        
    }

    /* -----------------------------------------------------
     * IV. Business Logic
     * -----------------------------------------------------
     */

    /**
     * Generate Block markup for whatever is inside 'options' method of a BLock
     * 
     * @global object post
     * @param array block
     * @param $context | area context
     * @param open | css class kb_open added / not added
     * @param args array (post_type, 'page_template')
     */
    public function _render_options( $open = false )
    {
        global $post, $Kontentblocks;

        $this->open = $open;

        /* $post is not available during an ajax call
         * but we're using the same function for blocks already added, and new added block via AJAX
         * maybe just check for XHR request
         * 
         */
        // set post_id
//        if ( !isset( $post->ID ) ) {
//            if ( true == $Kontentblocks->post_context ) {
//                $this->post_id = $_REQUEST[ 'post_id' ];
//            }
//            else {
//                $this->post_id = null;
//            }
//        }
//        else {
//            $this->post_id = $post->ID;
//        }
        // open tag for block list item
        echo $this->_open_list_item();

        //markup for block header
        echo $this->header();

        // inner block open
        echo $this->_open_inner();

        // if disabled don't output, just show disabled message
        if ( $this->settings[ 'disabled' ] ) {
            echo "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
        }
        else {
            // output the form fields for this block
            $this->options( $this->new_instance );
        }
                    
        echo $this->footer();

        echo $this->_close_inner();

        echo $this->_close_list_item();

    }

    private function _open_list_item()
    {
        // extract the block id number
        $count = strrchr( $this->instance_id, "_" );

        // classname
        $classname = get_class( $this );

        // additional classes to set for the item

        $disabledclass = ($this->settings[ 'disabled' ]) ? 'disabled' : null;
        $uidisabled    = ($this->settings[ 'disabled' ]) ? 'ui-state-disabled' : null;

        //$locked = ( $this->locked == 'false' || empty($this->locked) ) ? 'unlocked' : 'locked';
        //$predefined = (isset($this->settings['predefined']) and $this->settings['predefined'] == '1') ? $this->settings['predefined'] : null;
        $unsortable = ((isset( $this->settings[ 'unsortable' ] ) and $this->settings[ 'unsortable' ]) == '1') ? 'cantsort' : null;

        $openclass = (true == $this->open) ? 'kb-open' : null;
        // Block List Item
        return "<li id='{$this->instance_id}' rel='{$this->instance_id}{$count}' data-blockclass='{$classname}' class='{$this->id} kb_wrapper kb_block {$this->status} {$disabledclass} {$uidisabled} {$unsortable} {$openclass}'>
		<input type='hidden' name='{$this->instance_id}[area_context]' value='$this->area_context' /> 
		";

    }

    /*
     * Close list item
     */

    private function _close_list_item()
    {
        return "</li>";

    }

    /*
     * Outputs everything inside the block
     */

    private function _open_inner()
    {
        $lockedmsg = (!current_user_can( 'lock_kontentblocks' )) ? 'Content is locked' : null;

        // markup for each block
        $out = "<div class='kb_inner'>";

        if ( $lockedmsg && KONTENTLOCK ) {
            echo $lockedmsg;
        }
        else {
            $description       = (!empty( $this->settings[ 'description' ] )) ? __( '<strong><em>Beschreibung:</em> </strong>' ) . $this->settings[ 'description' ] : '';
            $l18n_block_title  = __( 'Modul Bezeichnung', 'kontentblocks' );
            $l18n_draft_status = ( $this->draft == 'true' ) ? '<p class="kb_draft">' . __( 'This Module is a draft and won\'t be public until you publish or update the post', 'kontentblocks' ) . '</p>' : '';

            $out .= "<div class='kb_block_title'>";

            if ( !empty( $description ) )
               // $out .= "<p class='description'>{$description}</p>";

            $out .= "		<div class='block-notice hide'>
							<p>Es wurden Veränderungen vorgenommen. <input type='submit' class='button-primary' value='Aktualisieren' /></p>
						</div>
						{$l18n_draft_status}
					</div>";
        }
        return $out;

    }

    /*
     * Close block inner
     */

    private function _close_inner()
    {
        return "</div>";

    }

    /**
     * Create Markup for Block Header
     * 
     */
    private function header()
    {
        $html = '';

        //open header
        $html .="<div rel='{$this->instance_id}' class='block-head clearfix edit kb-title'>";


        $html .= "<div class='kb-move'></div>";
        // toggle button
        $html .="<div class='kb-toggle'></div>";

        $html .= "<div class='kb-inactive-indicator kb_set_status'></div>";

        // locked icon
        if ( !$this->settings[ 'disabled' ] && KONTENTLOCK ) {
            $html .="<div class='kb-lock {$this->locked}'></div>";
        }

        // disabled icon
        if ( $this->settings[ 'disabled' ] ) {
            $html .="<div class='kb-disabled-icon'></div>";
        }

        // name
        $html .="<div class='kb-name'><input class='block-title' type='text' name='{$this->instance_id}[block_title]' value='{$this->name}' /></div>";

        // original name
        $html .="<div class='kb-sub-name'>{$this->settings[ 'public_name' ]}</div>";

        // Open the drop down menu
        $html .= "<div class='menu-wrap'>
			
			<div class='kb_dd_menu kb_menu_opener'>Actions</div>
			<ul class='kb_the_menu bar kb_dd_list'>";

        // delete button
        if ( !$this->settings[ 'predefined' ] ) {
            if ( !$this->settings[ 'disabled' ] ) {
                if ( current_user_can( 'delete_kontentblocks' ) )
                    $html .="<li><div class='kb-delete kb_delete_block block-menu-icon'></div></li>";
            }
        }

        // status button
        if ( !$this->settings[ 'disabled' ] ) {
            if ( current_user_can( 'deactivate_kontentblocks' ) )
                $html .="<li><div class='kb-power kb_set_status block-menu-icon {$this->status}'></div></li>";
        }

        // TODO: Cap Check
        $html .= "<li><div class='kb-duplicate block-menu-icon'></div></a></li>";

        $html = apply_filters( 'kb_block_header_menu', $html, $this );


        $html .= "</ul></div>";


        // ajax spinner
        $html .="<div class='kb-ajax-status'></div>";


        //close header
        $html .="</div>";

        return $html;

    }

    /*
     * Block Footer Actions
     */

    public function footer()
    {
        do_action( "block_footer_{$this->id}" );
        do_action( 'block_footer', $this );
    }


    /**
     * On Site Edit link for logged in users 
     */
    public function print_edit_link( $post_id = null )
    {


        $edittext = (!empty( $this->settings[ 'os_edittext' ] )) ? $this->settings[ 'os_edittext' ] : __( 'edit' );

        global $Kontentblocks, $post;

        $link_class = null;
        $admin   = admin_url();
        if ( $post_id === null )
            $post_id = (!empty( $_REQUEST[ 'post_id' ] )) ? $_REQUEST[ 'post_id' ] : $post->ID;

        $context = ($Kontentblocks->post_context) ? 'true' : 'false';

        $class         = get_class( $this );
        $area_context  = $this->area_context;
        $columns       = $this->columns;
        $page_template = $this->page_template;
        $post_type     = $this->post_type;
        $subcontext    = $this->subcontext;
        $instance_id   = $this->instance_id;

        // overrides for master templates
        if ( !empty( $this->master ) && $this->master === true ) {

            $tpls = $Kontentblocks->get_block_templates();

            $reference = (isset( $this->master_ref )) ? $this->master_ref : null;

            if ( !$reference ) {
                $reference = $this->instance_id;
            }


            $block       = $tpls[ $reference ];
            $class       = $block[ 'class' ];
            $context     = 'false';
            $instance_id = $reference;
            $link_class  = 'master';
        }


        $nonce = wp_create_nonce( 'onsiteedit' );
        $this->editURL = "{$admin}/admin-ajax.php?action=os-edit-module&daction=show&post_id={$post_id}&context={$context}&area_context={$area_context}&columns={$columns}&instance={$instance_id}&class={$class}&subcontext={$subcontext}&page_template={$page_template}&post_type={$post_type}&_wpnonce={$nonce}&TB_iframe=1&height=600&width=800";
        
        $out = "
		<div class='os-edit-wrapper os-controls {$link_class}'>
		<a class='reveal os-edit-block' title='{$edittext}' data='{$this->instance_id}' data-url='{$admin}/admin-ajax.php?
		action=os-edit-module&
		daction=show&
		post_id={$post_id}&
		context={$context}&
		area_context={$area_context}&
		columns={$columns}&
		instance={$instance_id}&
		class={$class}&
		subcontext={$subcontext}&
		page_template={$page_template}&
		post_type={$post_type}&
		_wpnonce={$nonce}&
		TB_iframe=1&
		height=600&
		width=800'><span></span>{$edittext}</a>
		<a class='os-description' title='{$this->settings[ 'description' ]}'>info</a>
		</div>";

        //return $out;

    }

    /* -----------------------------------------------------
     * V. Helper
     * -----------------------------------------------------
     */

    /* set()
     * Public method to set class properties
     * expects $args to be an associative array with key => value pairs
     */

    public function set( $args )
    {
        if ( !is_array( $args ) ) {
            _doing_it_wrong( 'set() on block instance', '$args must be an array of key/value pairs', '0.7' );
            return false;
        }

        foreach ( $args as $k => $v )
            $this->$k = $v;

    }

    /**
     * Set active/inactive status of this instance
     * @param string $status 
     */
    public function set_status( $status )
    {
        if ( $status == 'kb_inactive' ) {
            $this->active = false;
        }
        elseif ( $status == 'kb_active' or $status == '' ) {
            $this->active = true;
        }

    }

    /**
     * Set draft status of this instance 
     */
    public function set_draft( $draft )
    {
        if ( $draft == 'true' ) {
            $this->draft = true;
        }
        elseif ( $draft == 'false' ) {
            $this->draft = false;
        }

    }

    /**
     * Set the area where this Block is located 
     */
    public function set_area( $area )
    {
        $this->area = $area;

    }

    /*
     * Render widget title
     * A helper method
     */

    public function _render_widget_title( $subcontext )
    {
        if ( 'side' == $subcontext ) {

            if ( !empty( $this->new_instance[ 'widget_title' ] ) ) {
                $widget_title = apply_filters( 'the_title', $this->new_instance[ 'widget_title' ] );
                $headline     = apply_filters( 'kb_widget_headline_weight', 'h3' );
                return "<{$headline} class='widget-title'>{$widget_title}</{$headline}>";
            }
        }

    }

    /*
     * Return data
     */

    public function get_data( $key = null, $return = '' )
    {
        $data = $this->new_instance;

        if ( empty( $data ) or empty( $key ) )
            return false;

        return (!empty( $data[ $key ] )) ? $data[ $key ] : $return;

    }

    /*
     * Set Additional data
     */

    public function set_data( $key, $value )
    {
        $this->new_instance[ $key ] = $value;

    }

    /*
     * Get resized image
     */

    public function get_image_url( $id, $width = 150, $height = 150, $crop = true )
    {


        if ( !isset( $id ) )
            return false;

        $src = wp_get_attachment_image_src( $id, 'full' );


        $return = wp_img_resizer_src( array( 'url' => $src[ 0 ], 'height' => $height, 'width' => $width, 'crop' => $crop ) );

        if ( !is_wp_error( $return ) )
            return $return;
        else
            return '';

    }

    public function get_module_path( $path )
    {
        return dirname( $path );

    }

    public function getImageObject( $id, $width = 150, $height = 150, $crop = true )
    {
        if ( empty( $id ) )
            return false;

        return new ImageObject( $id, $width, $height, $crop );

    }
    
    
    public function toJSON(){
        
        $dump = json_encode(get_object_vars($this));
        
        echo "<script>"
        . "var Konfig = Konfig || [];"
            . "Konfig.push({$dump});"
            . "</script>";
        
    }

//    public function get_link_object( $href )
//    {
//        if ( empty( $href ) )
//            return false;
//
//        return new KB_Link_Object( $href );
//
//    }

}

//end class