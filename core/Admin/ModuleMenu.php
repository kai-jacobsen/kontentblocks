<?php

namespace Kontentblocks\Admin;

/*
 * Kontentblocks: Areas: Menu Class
 * @package Kontentblocks
 * @subpackage Areas 
 */

class ModuleMenu
{
    /*
     * Blocks available through menu
     */

    public $blocks = array();


    /*
     * Blocks sorted by their category
     */
    public $categories = array();


    /*
     * Whitelist for available categories
     */
    public $cats = array();

    /*
     * Area id passed to constructor for unique container ids
     */
    private $id = '';

    /*
     * Area context passed to constructor
     */
    private $context = '';

    /*
     * Localization String
     */
    public $l18n = array();

    /*
     * Constructor
     */

    function __construct( $blocks, $id, $context )
    {

        if ( empty( $blocks ) or !is_array( $blocks ) or !isset( $id ) or !isset( $context ) )
            return false;

        //assign id
        $this->id = $id;

        //assign context
        $this->context = $context;

        //assign blocks
        $this->blocks = $blocks;

        //setup available cats
        $this->_setup_cats();

        $this->_prepare_categories();

        // sort blocks to categories
        $this->_blocks_to_categories();


        $this->l18n = array(
            // l18n
            'add_block' => __( 'add module', 'kontentblocks' ),
            'add' => __( 'add', 'kontentblocks' ),
            'add_template' => __( 'add template', 'kontentblocks' ),
            'no_blocks' => __( 'Sorry, no Blocks available for this Area', 'kontentblocks' ),
            'modules' => __( 'Add new module', 'kontentblocks' )
        );

        add_action( 'admin_footer', array( $this, 'menu_footer' ), 10, 1 );

    }

    /* Menu Footer
     * 
     * Print modal menu contents to the admin footer
     * Makes sure that the modal is outside of wp-wrap and positions as expected
     */

    public function menu_footer()
    {
        // prepare a class for the menu <ul> to avoid two columns if not necessary
        $menu_class = ( count( $this->blocks ) <= 4 ) ? 'one-column-menu' : 'two-column-menu';

        $out = "<div id='{$this->id}-nav' class='reveal-modal modules-menu-overlay {$menu_class}'>";
        $out.= "<div class='modal-inner cf'>";

        $out .= "<div class='area-blocks-menu-tabs'>";
        $out .= $this->_get_nav_tabs();
        $out .= $this->_get_tabs_content();
        $out .= "</div>";

        $out .= "</div>"; // end inner
        $out .= "</div>"; // end moddal container
        echo $out;

    }

    /*
     * Admin menu link, opens the modal
     */

    public function menu_link()
    {

        if ( current_user_can( 'create_kontentblocks' ) ) {
            if ( !empty( $this->blocks ) ) {
                $out = " <div class='add-modules cantsort'>
							<a class='modal modules-link' 
							href='#'
							data-area='{$this->id}'
							data-reveal-id_='{$this->id}-nav' 
							data-animation='fade' 
							data-animationSpeed='150'>
							{$this->l18n[ 'modules' ]}
						</a>
					</div>";
                return $out;
            }
        return false;
        }

    }

    /*
     * Tab Navigation for categories markup
     */

    private function _get_nav_tabs()
    {
        $out = '';

        $out .= "<ul id='blocks-menu-{$this->id}-nav' class='block-menu-tabs'>";

        $i = 1;
        foreach ( $this->categories as $cat => $items ) {
            if ( $i !== 1 && empty( $items ) )
                continue;

            $out .= "<li> <a href='#{$this->id}-{$cat}-tab'>{$this->cats[ $cat ]}</a></li>";

            $i++;
        }

        $out .= "</ul>";

        return $out;

    }

    /*
     * Markup for tabs content
     */

    private function _get_tabs_content()
    {

        if ( current_user_can( 'create_kontentblocks' ) ) {
            $out = '';

            foreach ( $this->categories as $cat => $items ) {

                $out.= "<div id='{$this->id}-{$cat}-tab'>";
                $out.= "<ul  class='blocks-menu'>";


                foreach ( $items as $item ) {
                    $out.= $this->_get_item( $item );
                }



                $out.= "</ul>";
                $out.= "</div>";
            }
            return $out;
        }

    }

    /*
     * Markup for menu normal items
     */

    private function _get_item( $item )
    {

        $settings = $item->settings;

        if ( isset( $settings[ 'hidden' ] ) && $settings[ 'hidden' ] == true )
            return null;


        $instance_id = (isset( $item->instance_id )) ? "data-instance_id='{$item->instance_id}'" : null;
        $master      = (isset( $item->master )) ? "data-master=master" : null;


        $img        = (!empty( $settings[ 'icon' ] )) ? $settings[ 'icon' ] : '';
        $blockclass = get_class( $item );

        $out = "	<li class='block-nav-item' data-value='{$blockclass}' {$instance_id} {$master} data-context='{$this->context}' >
						<div class='block-icon'><img src='{$img}' ></div>
						<div class='block-info'><h3>{$settings[ 'public_name' ]}</h3>
							<p class='description'>{$settings[ 'description' ]}</p>
						</div>
						<span class='action'>{$this->l18n[ 'add' ]}</span>
					</li>";
        return $out;

    }

    /*
     * Sort blocks to categories
     * If category is not set, assign the first from the whitelist
     */

    private function _blocks_to_categories()
    {
        global $Kontentblocks;

        foreach ( $this->blocks as $block ) {
            // check for categories
            $cat                         = (!empty( $block->settings[ 'category' ] )) ? $this->_get_valid_category( $block->settings[ 'category' ] ) : 'standard';
            $this->categories[ $cat ][] = $block;
        }

        // add templates
        $saved_block_templates = get_option( 'kb_block_templates' );

        if ( !empty( $saved_block_templates ) ) {
            foreach ( $saved_block_templates as $tpl ) {
                //$blocks[ $tpl[ 'class' ] ] = $Kontentblocks->blocks[ $tpl[ 'class' ] ];

                $this->categories[ 'templates' ][ $tpl[ 'instance_id' ] ] = new $tpl[ 'class' ];

                if ( !empty( $tpl[ 'instance_id' ] ) ) {
                    $this->categories[ 'templates' ][ $tpl[ 'instance_id' ] ]->instance_id             = $tpl[ 'instance_id' ];
                    $this->categories[ 'templates' ][ $tpl[ 'instance_id' ] ]->settings[ 'public_name' ] = $tpl[ 'name' ];
                }

                if ( !empty( $tpl[ 'master' ] ) ) {
                    $this->categories[ 'templates' ][ $tpl[ 'instance_id' ] ]->master = true;
                }
            }
        }

    }

    /*
     * Validate category against whitelist
     * If it fails, assign the first category of the whitelist
     */

    private function _get_valid_category( $cat )
    {

        foreach ( $this->cats as $c => $name ) {
            if ( $c == $cat )
                return $cat;
        }
        return (isset( $this->cats[ 0 ] )) ? $this->cats[ 0 ] : false;

    }

    /*
     * Filterable array of allowed cats
     * uses @filter kb_menu_cats
     * @return void
     */

    private function _setup_cats()
    {
        // defaults
        $cats = array(
            'standard' => __( 'Standard', 'kontentblocks' ),
        );

        $cats = apply_filters( 'kb_menu_cats', $cats );

        
        $cats[ 'media']     = __('Media', 'kontentblocks');
        $cats[ 'special' ]   = __( 'Spezial', 'kontentblocks' );
        
        $cats[ 'core' ]      = __( 'System', 'kontentblocks' );
        $cats[ 'templates' ] = __( 'Templates', 'kontentblocks' );

        $this->cats = $cats;

    }

    /*
     * Create initial array to preserve the right order
     */

    public function _prepare_categories()
    {
        foreach ( $this->cats as $cat => $name ) {
            $this->categories[ $cat ] = array();
        }

    }

}
