<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Modules\Module;

//======================================
// Purpose of this Class
//-------------------------------------
// The main intention was to unclutter the main kontentblocks.php
// file and to gain more fine control over rendering of modules.
// By now it's at least possible to extend this class and override the
// main rendering methods with something else.
// 
// TODO: More refinement, more filters, more everything
//======================================

class AreaRender
{
    // Properties

    /**
     * Kontentblocks Manager Object
     * has some useful informations about the global state
     * @var object
     */
    private $manager;

    /**
     * Internal identifier
     * @var string
     */
    private $id = '';

    /**
     * Available Modules(Blocks) in this area
     * @var array
     */
    private $available_modules = array();

    /**
     * Attached Modules in Array structure
     * @var array
     */
    public $raw_modules = array();

    /**
     * Attached Modules in Object structure
     * @var array
     */
    public $modules = array();

    /**
     * Is Dynamic Area or not
     * @var boolean
     */
    private $dynamic = false;

    /**
     * Area Templates registered to thos area
     */
    private $area_templates = array();

    /**
     * Area Template, if selected
     * @var string id of area template
     */
    private $area_template = null;

    /**
     * Post ID, if in post context.
     * Should be '0' if not in post context
     * @var int
     */
    public $post_id = 0;

    /**
     * Wrapper Markup before
     * @var string
     */
    private $before = '';

    /**
     * Wrapper markup after
     * @var string
     */
    private $after = '';

    /**
     * public main context
     * @var string
     */
    public $context = '';

    /**
     * public subcontext
     * @var string 
     */
    public $subcontext = '';

    /**
     * public post context
     */
    public $post_context = true;

    /**
     * Internal counter for output iterations
     */
    private $counter = 0;

    /**
     * Construct
     * @param array $args | registered area args
     */
    public function __construct( $manager, $post_id, $args, $context, $subcontext )
    {
        // Inject Kontentblocks Manager Object
        $this->manager = $manager;

        // setup necessary properties from register args
        $this->_property_setup( $args );

        // set post context
        $this->_set_post_context();

        // set post id
        $this->post_id = $post_id;

        // setup context
        $this->setup_area_context( $context, $subcontext );

        // rollin'
        $this->prepare_area();
    }

    /**
     * Prepare and gather all necessary module data
     */
    public function prepare_area()
    {
        /**
         * Get modules from post meta or option
         */
        $this->modules = $this->get_modules();
        //bail if empty
        if ( empty( $this->raw_modules ) ) {
            return false;
        }
        // Instantiate Modules
        $this->modules = $this->setup_modules();

        /**
         * Get individual settings from post meta or option
         */
        $this->settings = $this->get_settings();

        // If we have settings, we can prepare the area template
        if ( $this->settings )
            $this->area_template = $this->_set_area_template();

    }

    /**
     * Main Render method
     * 
     * This one shouldn't be overridden
     * @param boold $echo Echo the result directly or just return
     * @return string | resulting html
     */
    public function render( $echo = true )
    {
        $tmp            = $tmpcol         = null;
        $element_id     = $pre_element_id = '';

        $element_count = count( $this->modules );

        $area_template_cols = (!empty( $this->area_template[ 'columns' ] )) ?
            $this->area_template[ 'columns' ] : false;

        // collect html
        $output = '';



        if ( empty( $this->modules ) )
            return false;
        // general module properties
        $module_args = $this->_this_prepare_module_args();

        // start to count
        $this->counter = 1;

        // before 
        $output .= $this->area_start( $this->before, $this->modules );

        foreach ( $this->modules as $module ) {
            // if this block gets wrapped ( area templates ) collect all wrapper classes here
            $wrapperclasses = array();


            $element_id = $module->settings['id'];

            if ( $element_id == $pre_element_id )
                $module->repeater = true;

            // set column property if available
            if ( !empty( $area_template_cols ) ) {
                $tmpcol          = array_shift( $area_template_cols );
                $module->columns = $tmpcol;
            }


            // add wrapper classes as set by area-templates
            if ( !empty( $this->area_template[ 'classes' ] ) ) {
                $tmp = array_shift( $this->area_template[ 'classes' ] );

                $wrapperclasses[] = $tmp;
            }

            // add last-item if set
            if ( !empty( $this->area_template[ 'last-item' ] ) ) {

                if ( $this->counter % ($this->area_template[ 'last-item' ]) == 0 ) {
                    $wrapperclasses[] = 'last-item';
                }
            }

            // set some instance properties
            $module->set( $module_args );

            // Set data
            $module->new_instance = $this->_get_instance_data( $module );



            $output .= $this->before_module( $wrapperclasses, $module );

            $output .= $this->module( $module );

            $output .= $this->after_module( $wrapperclasses, $module );



            $this->counter++;

            if ( isset( $this->area_template[ 'classes' ] ) )
                array_push( $this->area_template[ 'classes' ], $tmp );

            if ( false !== $area_template_cols )
                array_push( $area_template_cols, $tmpcol );


            $pre_element_id = $module->settings['id'];
        }


        $output .= $this->area_end( $this->after, $this->modules );

        if ( false === $echo )
            return $output;
        else
            echo $output;

    }

    /**
     * Method fires before each module
     * 
     * @param array $wrapperclasses
     * @param object $module
     * @return string HTML
     */
    public function before_module( $wrapperclasses, $module )
    {
        // module specific html output
        $mhtml = null;

        // if blocks gets wrapped by area template
        if ( !empty( $wrapperclasses ) ) {
            $mhtml .= $this->module_wrapper_before( $wrapperclasses );
        }

        // if this blocks uses a wrapper (default behaviour), print before markup
        if ( $module->settings['wrap'] ) {
            // Additional Classes to add to the wrapper
            $classestoadd[] = $this->_get_element_class();
            $classestoadd[] = (isset( $module->repeater ) && $module->repeater === true) ? ' repeater' : null;

            // add On Site Editor container 
            if ( is_user_logged_in() )
                $classestoadd[] = 'os-edit-container';
            // add classes to markup
            if ( !empty( $classestoadd ) ) {
                $mhtml .= sprintf( stripslashes( $module->settings['beforeModule'] ), $module->instance_id, $module->settings['id'], implode( ' ', $classestoadd ) );
            }
            else {
                $mhtml .= sprintf( stripslashes( $module->settings[ 'beforeModule' ] ), NULL );
            }
        }

        // if wrapper is set to false we need a container anyway for os-edit capability
        elseif ( is_user_logged_in() && !$module->settings[ 'wrapper' ] ) {
            $mhtml .= "<div class='os-edit-container'>";
        }


        // Call the setup method if it exists
        if ( method_exists( $module, 'setup' ) )
            $mhtml .= $module->setup();

        return $mhtml;

    }

    public function after_module( $wrapperclasses, $module )
    {
        $mhtml = null;

        // if block uses wrapper, print after markup
        if ( $module->settings['wrap'] ) {
            $mhtml .= $module->settings['afterModule'];
        }
        elseif ( is_user_logged_in() && !$module->settings['wrap'] ) {
            // close os-edit-container if block doesnt use a wrapper
            $mhtml .= "</div>";
        }
        if ( !empty( $wrapperclasses ) ) {
            $mhtml .= $this->module_wrapper_after( $wrapperclasses );
        }

        // Call the shutdown method if it exists
        if ( method_exists( $module, 'shutdown' ) ) {
            $mhtml .= $module->shutdown();
        }

        $module->toJSON();

        return $mhtml;

    }

    /**
     * If an Area template wraps our modules, this gets called before each module
     * @param array $wrapperclasses
     * @return string HTML
     */
    public function module_wrapper_before( $wrapperclasses )
    {
        $before = '<div class="%s">';
        $output = sprintf( $before, implode( ' ', $wrapperclasses ) );

        return $output;

    }

    /**
     * Close the wrapper
     * @param array $wrapperclasses
     * @return string HTML
     */
    public function module_wrapper_after( $wrapperclasses )
    {
        return "</div>";

    }

    /**
     * Call the modules output function
     * and handle caching for the inner html
     * @param object $module
     * @return string HTML
     */
    public function module( $module )
    {

        $mhtml = null;



        // inner HTML
        $html = $module->module( $module->new_instance );
        
        // Some modules might return false, that's ok
        if ( false === $html ) {
            return false;
        }

        // Let a Module shortcircuit this.
        if ( is_object( $html ) ) {

            if ( method_exists( $html, 'block' ) ) {

                $html = $html->module( $html->external_data );
            }
        }

        $mhtml .= $html;



        if ( is_user_logged_in() && current_user_can( 'edit_kontentblocks' ) ) {
            $mhtml .= $module->print_edit_link( $this->post_id );
        }

        return $mhtml;

    }

    public function area_start( $before_string, $modules )
    {
        $output = '';

        $classes = array();

        //free additional classes
        if ( !empty( $this->settings[ 'free-classes' ] ) ) {
            $classes[] = explode( ' ', $this->settings[ 'free-classes' ] );
        }

        if ( !empty( $this->area_template[ 'area-class' ] ) ) {
            $classes[] = $this->area_template[ 'area-class' ];
        }
        $classes[] = $this->context;
        $classes[] = $this->subcontext;

        // if there are settings we use them
        if ( !empty( $classes ) ) {
            $classes = implode( ' ', $classes );

            // insert additional classes to the output
            $output .= sprintf( $before_string, $this->id, $classes );
        }
        else {
            // no additional settings
            $output .= sprintf( $before_string, $this->id, NULL );
        }

        return $output;

    }

    public function area_end( $after_string, $modules )
    {

        return $after_string;

    }

    // ------------------------------------------------
    // Setup Below this line
    // ------------------------------------------------

    /**
     * Setup properties from §args array
     * Declare defaults
     * 
     * @uses filter kb_area_args_to_render
     */
    private function _property_setup( $args )
    {

        $args = apply_filters( 'kb_area_args_to_render', $args );

        $this->id                = $args[ 'id' ];
        $this->available_modules = $args[ 'available_blocks' ];
        $this->before            = $args[ 'before_area' ];
        $this->after             = $args[ 'after_area' ];
        $this->dynamic           = $args[ 'dynamic' ];
        $this->area_templates    = $args[ 'area_templates' ];

    }

    /**
     * Set up primary context and subcontext
     * Filter may overrides this specific for area id
     * 
     * @uses filter $areaID_context && $areaID_subcontext
     */
    public function setup_area_context( $context = '', $subcontext = '' )
    {
        $this->context    = apply_filters( "{$this->id}_context", $context );
        $this->subcontext = apply_filters( "{$this->id}_subcontext", $subcontext );

    }

    /**
     * Get data from post meta or option
     */
    private function _set_post_context()
    {
        if ( true === $this->dynamic )
            $this->post_context = false;

    }

    /**
     * Get all Modules which are saved to this post / data context
     * Pre filter for this area
     */
    public function get_modules()
    {
        $modules = false;

        if ( true === $this->post_context ) {
            $modules = get_post_meta( $this->post_id, 'kb_kontentblocks', true );
        }
        else {
            $dynamic_areas = get_option( 'kb_dynamic_areas' );

            if ( !empty( $dynamic_areas[ $this->id ] ) )
                $modules = $dynamic_areas[ $this->id ];
        }

        if ( $modules ) {
            foreach ( $modules as $module ) {
                if ( $module[ 'area' ] === $this->id )
                    $this->raw_modules[ $module[ 'instance_id' ] ] = $module;
            }
        }
        else {
            $this->raw_modules = false;
        }

    }

    /**
     * Each area might have some individuals settings per post / data context
     * @return mixed | Settings array or false
     */
    public function get_settings()
    {
        // TODO: What about dynamic areas?

        $all = get_post_meta( $this->post_id, 'kb_area_settings', true );

        if ( !empty( $all[ $this->id ] ) ) {
            return $all[ $this->id ];
        }
        else {
            return false;
        }

    }

    /**
     * Setup the area template if one is used
     * If it's a custom virtual template, prepare it
     */
    public function _set_area_template()
    {

        if ( !empty( $this->settings[ 'custom' ] ) )
            $area_template = $this->_virtual_template( $this->settings[ 'custom' ] );
        elseif ( !empty( $this->settings[ 'area_template' ] ) )
            $area_template = $this->_get_area_template();
        else
            $area_template = false;


        if ( $area_template ) {
            $area_template[ 'classes' ] = $this->_get_area_template_classes( $area_template );
            $area_template[ 'columns' ] = $this->_get_area_template_columns( $area_template );
        }

        return $area_template;

    }

    /**
     * Creates a template from given obscure string
     * @param string $string
     * @return array
     */
    public function _virtual_template( $string )
    {
        $columns = explode( ',', $string );

        foreach ( $columns as $col ) {
            $layout[] = array(
                'classes' => $this->_translate_col( $col ),
                'columns' => $col
            );
        };

        $template = array(
            'id' => 'fictional',
            'name' => 'Bond, James Bond',
            'layout' => $layout,
            'last-item' => false
        );

        return $template;

    }

    /**
     * Translate integers and special chars to class names
     * 
     * @var string $classes
     */
    public function _translate_col( $col )
    {
        $classes = '';

        $test = explode( '.', $col );

        if ( !empty( $test ) )
            return $this->_translate_col_new( $col );

        foreach ( str_split( $col ) as $char ) {

            switch ( $char ) {
                case '1';
                    $classes .= 'full';
                    break;

                case '2';
                    $classes .= 'one-half';
                    break;

                case '3';
                    $classes .= 'one-third';
                    break;

                case '1/3';
                    $classes .= 'one-third';
                    break;

                case '4';
                    $classes .= 'one-fourth';
                    break;

                case '-':
                    $classes .= ' last-item';
                    break;

                case 'c';
                    $classes .= " clear";
                    break;
            }
        }
        return $classes;

    }

    /**
     * Translate integers and special chars to class names
     * 
     * @var string $classes
     */
    public function _translate_col_new( $col )
    {
        $classes = '';


        foreach ( explode( '.', $col ) as $chunk ) {
            switch ( trim( $chunk ) ) {


                case '1';
                    $classes .= 'full';
                    break;

                case '2';
                    $classes .= 'one-half';
                    break;

                case '3';
                    $classes .= 'one-third';
                    break;

                case '4';
                    $classes .= 'one-fourth';
                    break;

                case '1/3';
                    $classes .= 'one-third';
                    break;

                case '2/3';
                    $classes .= 'two-thirds';
                    break;


                case '-':
                    $classes .= ' last-item';
                    break;

                case 'c';
                    $classes .= " clear";
                    break;
            }
        }
        return $classes;

    }

    /**
     * Setup Modules
     * Returns actual available instances of modules 
     */
    public function setup_modules()
    {

        $collection = array();

        $modules = $this->_modify_modules( $this->raw_modules );

        $modules = $this->_setup_modules( $modules );
        foreach ( $modules as $instance ) {
            if ( isset( $_GET[ 'preview' ] ) && $_GET[ 'preview' ] == 'true' ) {
                $collection[] = $instance;
            }
            elseif (
                $instance->settings['active'] == false OR $instance->settings['draft'] == 'true' OR $instance->settings['disabled'] == true OR !apply_filters( 'kb_collect', $instance )
            ) {
                continue;
            }
            else {
                $collection[] = $instance;
            }
        }
        return $collection;

    }

    /**
     * Modify Modules
     * 
     * Used by Master Templates to override some original arguments
     * TODO: extend to a wider use range
     * @param array $modules
     * @return array of possible modified raw modules
     */
    public function _modify_modules( $modules )
    {
        $collection = array();

        foreach ( $modules as $module => $item ) {

            if ( isset( $item[ 'master' ] ) && $item[ 'master' ] === true ) {
                $tpls = $this->manager->get_block_templates();

                $ref = (isset( $item[ 'master_reference' ] )) ? $item[ 'master_reference' ] : null;


                if ( empty( $ref ) ) {
                    $ref = get_option( $module );
                }

                $args = $tpls[ $ref ];


                $item['settings'][ 'class' ]       = $args[ 'class' ];
                $item[ 'instance_id' ] = $args[ 'instance_id' ];
                $item['settings'][ 'dynamic' ]     = true;

                $collection[ $module ] = $item;
            }
            else {
                $collection[ $module ] = $item;
            }
        }

        return $collection;

    }

    /**
     * Instantiate module classes
     * @param array $modules
     * @return array of instances
     */
    public function _setup_modules( $modules )
    {
        if ( empty( $modules ) ) {
            return false;
        }

        foreach ( ( array ) $modules as $module ) {

            $module = apply_filters( 'kb_modify_block', $module );
            $module = apply_filters( "kb_modify_block_{$module['settings'][ 'id' ]}", $module );

            $Factory = new ModuleFactory( $module );


            // new instance
            $instance = $Factory->getModule();

            $collection[] = $instance;
        }

        return $collection;

    }

    /**
     * Get area template and check for forced templates
     */
    public function _get_area_template()
    {
        if ( !empty( $this->modules ) ) {
            $blockcount = count( $this->modules );


            $assigned_area_templates = (!empty( $this->area_templates )) ? $this->area_templates : null;
            $forced_tpl              = (null != $assigned_area_templates) ? $this->_get_forced_templates( $assigned_area_templates ) : null;

            if ( !empty( $forced_tpl ) ) {
                foreach ( $forced_tpl as $ftpl ) {
                    if ( in_array( $blockcount, $ftpl[ 'force_by' ] ) ) {
                        return $ftpl;

                        break;
                    }
                }
            }

            if ( $this->manager->use_wrapper ) {
                if ( !empty( $this->manager->default_wrapper ) && is_array( $this->manager->default_wrapper ) ) {
                    return $this->manager->default_wrapper;
                }
            }



            if ( empty( $forced_tpl ) ) {

                $atpl = (!empty( $this->settings[ 'area_template' ] ) ) ? $this->settings[ 'area_template' ] : null;
                if ( null !== $atpl && $atpl !== 'default' ) {
                    return $this->manager->area_templates[ $atpl ];
                }
            }
        }

        return false;

    }

    private function _get_forced_templates( $assigned_area_templates )
    {
        $forced_areas = null;
        $settings     = array();

        if ( !empty( $assigned_area_templates ) ) {

            foreach ( $assigned_area_templates as $atpl ) {
                $atpl = (!empty( $this->area_templates[ $atpl ] )) ? $this->area_templates[ $atpl ] : null;
                if ( !empty( $atpl[ 'force_by' ] ) ) {
                    $forced_areas[] = $atpl;
                }
            }
        }

        if ( !empty( $forced_areas ) ) {
            foreach ( $forced_areas as $area ) {
                $settings[ $area[ 'id' ] ] = $area;
            }
        }

        return $settings;

    }

    public function _get_area_template_classes( $area_template )
    {

        $classes = array();

        if ( empty( $area_template[ 'layout' ] ) or !is_array( $area_template[ 'layout' ] ) )
            return $classes;

        foreach ( $area_template[ 'layout' ] as $col ) {
            if ( !empty( $col[ 'classes' ] ) )
                $classes[] = $col[ 'classes' ];
        }

        return $classes;

    }

    public function _get_area_template_columns( $area_template )
    {
        $columns = array();

        if ( empty( $area_template[ 'layout' ] ) or !is_array( $area_template[ 'layout' ] ) )
            return $columns;

        foreach ( $area_template[ 'layout' ] as $col ) {
            if ( !empty( $col[ 'columns' ] ) ) {
                $columns[] = $col[ 'columns' ];
            }
            else {
                $columns[] = null;
            }
        }

        return $columns;

    }

    /**
     * Prepare a set of instance properties
     * There is quite some stuff to inform the module about
     */
    public function _this_prepare_module_args()
    {
        $page_template = get_post_meta( $this->post_id, '_wp_page_template', true );
        return apply_filters( 'kb_prepare_module', array(
            'post_id' => $this->post_id,
            'page_template' => ($page_template === '') ? 'default' : $page_template,
            'post_type' => get_post_type( $this->post_id ),
            'context' => $this->context,
            'subcontext' => $this->subcontext,
            'area_template' => ($this->area_template) ? $this->area_template[ 'id' ] : false
            ) );

    }

    private function _get_instance_data( $module )
    {
        if ( isset( $module->master ) && $module->master === true )
            return get_option( $module->instance_id );

        if ( true === $this->post_context ) {
            if ( isset( $_GET[ 'preview' ] ) ) {
                $preview_data = get_post_meta( $this->post_id, '_preview_' . $module->instance_id, true );
                if ( !empty( $preview_data ) ) {
                    return $preview_data;
                }
                else {
                    return get_post_meta( $this->post_id, '_' . $module->instance_id, true );
                }
            }
            else {
                return get_post_meta( $this->post_id, '_' . $module->instance_id, true );
            }
        }
        else {
            return get_option( $module->instance_id );
        }

    }

    public function _get_element_class()
    {
        $class = __return_empty_array();

        if ( 1 == $this->counter )
            $class[] = " first-module";

        if ( count( $this->modules ) == $this->counter )
            $class[] = " last-module";

        $class[] = " element-{$this->counter}";

        return implode( ' ', $class );

    }
    


}
