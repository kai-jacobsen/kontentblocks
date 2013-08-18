<?php

class KBArea
{

    /**
     * Area ID 
     * @var string 
     */
    private $id = '';

    /**
     * Public Name
     * @var string
     */
    private $name = '';

    /**
     * Description
     * @var string
     */
    private $description = '';

    /**
     * Limit of Blocks this Area can hold
     * @var int
     */
    private $block_limit = '';

    /**
     * Array of Blocks allowed for this area
     * @var array
     */
    private $available_blocks = array( );

    /**
     * Templates available to this area
     * @var array
     */
    private $area_templates = array( );

    /**
     * Standard template
     * @var string
     */
    private $default_tpl = 'default';

    /**
     * Special Settings
     * @var array
     */
    public $saved_area_settings = array( );

    /**
     * Blocks assigned to this area
     * @var array
     */
    public $blocks = array( );
    private $settings = array( );

    /**
     * Normal, Top, Side, Bottom - Place on the Edit Screen
     * @var string
     */
    public $context = '';

    /**
     * current page template 
     */
    public $page_template;

    /**
     * current post type 
     */
    public $post_type;


    /*
     * Menu Instance for this area
     */
    private $menu;

    /**
     * Class Constructor
     * @param array $area
     * @return type 
     */
    function __construct( $area )
    {

        global $Kontentblocks;
        if ( empty( $area ) )
            return;

        // setup area
        $this->id               = $area[ 'id' ];
        $this->name             = $area[ 'name' ];
        $this->description      = $area[ 'description' ];
        $this->block_limit      = $area[ 'block_limit' ];
        $this->available_blocks = $area[ 'available_blocks' ];
        $this->area_templates   = (!empty( $area[ 'area_templates' ] )) ? $area[ 'area_templates' ] : array( );
        $this->default_tpl      = (!empty( $area[ 'default_tpl' ] )) ? $area[ 'default_tpl' ] : '';
        $this->context          = $area[ 'context' ];
        $this->menu             = new KBAreaMenu( $this->_find_available_blocks( $Kontentblocks->blocks ), $this->id, $this->context );

        // setup localization string
        $this->l18n = array(
            // l18n
            'add_block' => __( 'add module', 'kontentblocks' ),
            'add' => __( 'add', 'kontentblocks' ),
            'add_template' => __( 'add template', 'kontentblocks' ),
            'no_blocks' => __( 'Sorry, no Blocks available for this Area', 'kontentblocks' ),
            'modules' => __( 'Add new module', 'kontentblocks' )
        );

    }

    /**
     * Filter blocks by area, based upon settings
     * 
     * @global object Kontentblocks
     * return array 
     */
    private function _find_available_blocks( $blocks )
    {
        // declare array
        $available_blocks = array( );

        foreach ( $blocks as $block ) {
            $disabled = ($block->settings[ 'disabled' ] == true) ? true : false;

            $cat = (!empty( $block->settings[ 'category' ] )) ? $block->settings[ 'category' ] : false;

            if ( is_array( $this->available_blocks ) )
                $is__in_area_available = ( in_array( get_class( $block ), $this->available_blocks ) ) ? true : false;

            if ( $cat == 'core' ) {
                $available_blocks[ ] = $block;
            }
            elseif (
                true === $disabled OR false === $is__in_area_available
            ) {
                continue;
            }
            else {
                $available_blocks[ ] = $block;
            }
        }

        //sort alphabetically
        usort( $available_blocks, array( $this, '_sort_by_name' ) );

        return $available_blocks;

    }

    private function _sort_by_name( $a, $b )
    {
        $al = strtolower( $a->settings[ 'public_name' ] );
        $bl = strtolower( $b->settings[ 'public_name' ] );

        if ( $al == $bl ) {
            return 0;
        }
        return ($al > $bl) ? +1 : -1;

    }

    /*
     * -------------------------------
     * Area Settings
     * -------------------------------
     * 
     * Area Settings basically exists in order to add additional classes to the area wrapper on a
     * per post basis.
     * 
     * The second part handles Area Templates, which are actually predefined sets of classes
     * ============================================================================================
     */

    /**
     * Generate the settings menu
     * 
     * Checks if there are settings registered for this area id
     * If yes, checks if there are stored (post meta) settings to use
     * 
     * Generates the Markup for the Dropdown menu
     * 
     * @global type $Kontentblocks
     * @param type $id 
     */
    private function _generate_area_settings_menu( $id )
    {
        global $Kontentblocks;

        // array of settings args, no stored data, just registered settings
        if ( !empty( $Kontentblocks->area_settings[ $id ] ) ) {
            $area_settings = $Kontentblocks->area_settings[ $id ];
        }

        $stored_settings = $this->get_stored_settings( $id );


        // Markup and fields markup
        if ( !empty( $area_settings ) ) {
            echo "<div class='kb_area_settings kb_dd_menu'></div>
						<ul class='area_settings_list kb_dd_list'>";
            foreach ( $area_settings as $set ) {
                $this->_generate_area_settings( $set, $stored_settings );
            }
            echo "		</ul>";
        }

    }

    /**
     * This generates the markup for the dropdown menu
     * 
     * @param array $args
     * @param array $data 
     */
    private function _generate_area_settings( $args, $data )
    {

        $defaults = array
            (
            'type' => '', // field type
            'area_id' => '', // id of area
            'id' => '', // id of field
            'label' => '', // label
            'description' => '', // short description
            'value' => '', //setting
            'options' => array( ) // options for select field
        );

        $args = wp_parse_args( $args, $defaults );

        $type        = $args[ 'type' ];
        $area_id     = $args[ 'area_id' ];
        $id          = $args[ 'id' ];
        $label       = $args[ 'label' ];
        $description = $args[ 'description' ];
        $value       = $args[ 'value' ];
        $options     = $args[ 'options' ];

        echo "<li class='area_setting {$type}'>";

        switch ( $type ) {
            // last item takes a number and adds 'last-item' class to every nth elemnt	
            case 'last-item':
                echo '<label for="' . $area_id . '_' . $id . '">' . $label . '</label></br>';
                echo '<input type="text" id="' . $area_id . '_' . $id . '" name="' . $area_id . '[lastitem]" value="' . $data[ 'lastitem' ] . '" />';
                echo '<p class="description">' . $description . '</p>';
                break;

            // simple textfield, takes space seperated classes to be added to the wrapper
            case 'classes':
                echo '<label for="' . $area_id . '_' . $id . '">' . $label . '</label></br>';
                echo '<input type="text" id="' . $area_id . '_' . $id . '" name="' . $area_id . '[free-classes]" value="' . $data[ 'free-classes' ] . '" />';
                echo '<p class="description">' . $description . '</p>';
                break;
        } //end switch

        echo '</li>';

    }

    /**
     * Save registered area settings
     * This happens on save_post hook and gets called outside of class context
     * @param $k
     * @return type 
     */
    public static function save_custom_area_settings( $k )
    {

        $tosave = array( );

        // css classes to add to area
        // space seperated string gets stored
        $classes = '';

        $area_template = NULL;

        $last_item = NULL;


        if ( !empty( $_POST[ $k ] ) ) {

            $classes = array( );
            if ( !empty( $_POST[ $k ][ 'free-classes' ] ) ) {
                $classes = $_POST[ $k ][ 'free-classes' ];
            }


            if ( !empty( $_POST[ $k ][ 'lastitem' ] ) ) {
                $last_item = $_POST[ $k ][ 'lastitem' ];
            }

            if ( !empty( $_POST[ $k ][ 'area_template' ] ) ) {
                $area_template = $_POST[ $k ][ 'area_template' ];
            }
            if ( !empty( $_POST[ $k ][ 'custom' ] ) ) {
                $custom = $_POST[ $k ][ 'custom' ];
            }

            // build array
            $tosave = array(
                'free-classes' => $classes,
                'lastitem' => $last_item,
                'area_template' => $area_template,
                'custom' => $custom
            );
            return $tosave;
        }
        else {

            return false;
        }

    }

    /**
     * Creates the DropDown Menu for 'Area Templates' to chose from
     * @global type $Kontentblocks 
     */
    public function _generate_area_templates_menu()
    {
        global $Kontentblocks;

        $area_templates = $this->get_area_templates( $Kontentblocks->area_templates );

        // Markup and fields markup
        if ( !empty( $area_templates ) ) {
            $data   = $this->get_stored_settings( $this->id );
            $custom = (isset( $data[ 'custom' ] )) ? $data[ 'custom' ] : false;

            echo "
			<div class='kb_area_templates'>
				<a class='kb_dd_menu kb_menu_opener' href='#'>Templates</a>
				
				<ul class='kb_the_menu list kb_dd_list kb_open'>";
            foreach ( $area_templates as $tpl ) {
                self::generate_area_templates( $tpl, $this->id, $data );
            }

            echo "	
                <li><input name='{$this->id}[custom]' value='{$custom}' /></li>
                </ul></div>";
        }

    }

    /**
     * Creates the List Item for an a Area Template
     * @param array $tpl / saved args
     * @param string $id
     * @param array $data 
     */
    public function generate_area_templates( $tpl, $id, $data )
    {

        $imageurl = KB_PLUGIN_URL . 'css/area_tpls/';
        $image    = (!empty( $tpl[ 'thumbnail' ] ) ) ? $imageurl . $tpl[ 'thumbnail' ] : $imageurl . 'area-tpl-default.png';
        $tplid    = $this->get_selected_template( $tpl, $data );
        $checked  = checked( $tpl[ 'id' ], $tplid, false );

        $forceby = (!empty( $tpl[ 'force_by' ] )) ? 'data-force="' . implode( ' ', $tpl[ 'force_by' ] ) . '"' : null;

        $html = "<li class='area_template'>";

        $html .="<div class='area-tpl-item' {$forceby}>
				<input type='radio' name='{$id}[area_template]' id='{$tpl[ 'id' ]}' value='{$tpl[ 'id' ]}' {$checked} >
				<label for='{$tpl[ 'id' ]}'>{$tpl[ 'label' ]}</label>
				</div>";

        $html .="</li>";

        echo $html;

    }

    /**
     * Basically gets the saved Area Template
     * @global object $Kontentblocks
     * @param string $id
     * @return array 
     */
    public function get_stored_settings( $id )
    {
        global $Kontentblocks;


        // actual stored values for the registered settings for this post and area
        if ( !empty( $this->saved_area_settings[ $id ] ) ) {
            $stored_settings = $this->saved_area_settings[ $id ];
        }
        elseif ( !true == $Kontentblocks->post_context ) {
            $dynamic_area_stored_settings = get_option( 'kb_dynamic_areas_settings' );
            $stored_settings              = (!empty( $dynamic_area_stored_settings[ $id ] )) ? $dynamic_area_stored_settings[ $id ] : $this->_prepare_area_settings();
            ;
        }
        else {
            $stored_settings = $this->_prepare_area_settings();
        }


        return $stored_settings;

    }

    /**
     * Get Templates registered for this area
     * basically verifies that a template exists
     * @param array $registered_templates
     * @return array or void 
     */
    public function get_area_templates( $registered_templates )
    {
        $collect = array( );
        if ( !empty( $this->area_templates ) ) {
            foreach ( $this->area_templates as $tplid ) {
                if ( !empty( $registered_templates[ $tplid ] ) )
                    $collect[ $tplid ] = $registered_templates[ $tplid ];
            }
            return $collect;
        }
        else {
            return null;
        }

    }

    /**
     * Get selected Template
     * @param type $tpl
     * @param type $data
     * @return type 
     */
    private function get_selected_template( $tpl, $data )
    {
        if ( empty( $data[ 'area_template' ] ) ) {
            $tpl = (!empty( $this->default_tpl ) && in_array( $this->default_tpl, $this->area_templates )) ? $this->default_tpl : 'default';
        }
        else {
            $tpl = (!empty( $data[ 'area_template' ] ) ) ? $data[ 'area_template' ] : 'default';
        }

        return $tpl;

    }

    /*
     * -----------------------------------------------------
     * Block Menus
     * 
     * creates menu and modals for the available blocks menu
     * -----------------------------------------------------
     */

    /**
     * Helper for the Block Templates DropDown Menu
     * @global object $Kontentblocks
     * @param array $saved_block_templates
     * @return type 
     */
    public function _prepare_blocks( $saved_block_templates )
    {
        global $Kontentblocks;
        $blocks = __return_empty_array();

        foreach ( $saved_block_templates as $tpl ) {
            $blocks[ $tpl[ 'class' ] ] = $Kontentblocks->blocks[ $tpl[ 'class' ] ];

            if ( !empty( $tpl[ 'instance_id' ] ) )
                $blocks[ $tpl[ 'class' ] ]->instance_id = $tpl[ 'instance_id' ];
        }
        return $blocks;

    }

    /*
     * Get Markup for block limit indicator, return void if unlimited
     */

    private function _get_block_limit()
    {
        // prepare string, zero becomes infinity symbol
        $block_limit = ($this->block_limit == '0') ? null : absint( $this->block_limit );


        if ( null !== $block_limit ) {
            echo "<span class='block_limit'>Mögliche Anzahl Module: {$block_limit}</span>";
        }

    }

    /**
     * Do Area Header
     * 
     * Creates all the markup for the area header 
     */
    public function _do_area_header()
    {

        $header_class = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        echo "
					<div class='kb_area_head clearfix  {$this->context} {$header_class}'>";





        echo "	<div class='area_title_text '> ";

        $this->_generate_area_templates_menu();

        echo "	<span class='title'>{$this->name}</span>
				<span class='description'>{$this->description}</span>
					</div>";





        echo "
						<ul class='prime-actions cf clearfix'>";
        // menu for available blocks
        //echo $this->_get_block_menu_link();
        // templates menu 
        //$this->_generate_area_templates_menu();
        // menu for this area id
        //$this->_generate_area_settings_menu($this->id);

        echo "						</ul>
					";

        echo "	<div class='kb-ajax-status-dark'></div>
					</div>";

    }

    /**
     * Render all Blocks for this Area
     * @global type $Kontentblocks 
     */
    public function do_area_blocks()
    {
        // list of unavailable blocks, class names
        $unavailable_blocks = '';

        if ( !empty( $this->available_blocks ) && is_array( $this->available_blocks ) ) {
            $unavailable_blocks = implode( ' ', $this->available_blocks );
        }
        // list items for this area, block limit gets stored here
        echo "<ul style='' data-context='{$this->context}' data-page_template='{$this->page_template}' data-post_type='{$this->post_type}' data-blacklist='{$unavailable_blocks}' data-limit='{$this->block_limit}' id='{$this->id}' class='kb_connect kb_sortable kb_area_list_item kb-area'>";

        if ( !empty( $this->blocks ) ) {

            foreach ( $this->blocks as $block ) {
                $block->set(
                    array(
                        'area_context' => $this->context,
                        'post_type' => $this->post_type,
                        'page_template' => $this->page_template
                    )
                );
                $block->_render_options();
            }
        }

        echo "</ul>";

        if ( $this->menu )
            echo $this->menu->menu_link();

        // block limit
        $this->_get_block_limit();

    }

    /*
     * Helper Methods
     */

    public function set_context( $context )
    {
        $this->context = $context;

    }

    public function set_page_template( $template )
    {
        $this->page_template = $template;

    }

    public function set_post_type( $type )
    {
        $this->post_type = $type;

    }

    /**
     * Prepare area settings
     * makes sure there are actually some, just in case. 
     */
    private function _prepare_area_settings()
    {
        $defaults = array
            (
            'lastitem' => '',
            'free-classes' => '',
            'area_template' => '',
            'custom' => ''
        );

        return $defaults;

    }

}