<?php

namespace Kontentblocks\Fields;

define( 'KB_FIELD_PATH', plugin_dir_path( __FILE__ ) . 'Definitions/' );
define( 'KB_FIELD_CSS', plugin_dir_url( __FILE__ ) . 'Definitions/css/' );
define( 'KB_FIELD_JS', plugin_dir_url( __FILE__ ) . 'Definitions/js/' );

Class Kontentfields
{

    /**
     * Stores the current Block ID 
     * 
     * @type string
     * */
    public $blockid;

    /**
     * Stores a instance of every field
     * 
     * @type array | objects
     * */
    public $fields;

    /**
     * Stores the instance of the current used field
     * 
     * @type object
     * */
    public $instance;

    /**
     * Stores the reference to the parent 
     */
    public $parent;

    /**
     * Stores the data for the current block
     * 
     * @type array
     * */
    public $data;

    /**
     * Stores references to all fields used by the block
     * 
     * @type array
     * */
    private $collected_fields;

    /**
     * Stores the Classname of the Block, basically for use with Block spcific filters
     * 
     * @type string
     * */
    public $classname;

    /**
     * saved array of fields use by a block to call save method on them
     * 
     * @array
     * */
    private $fieldoptions;

    /**
     * Flag used to save fields to groups
     * 
     * @type string id of group
     * */
    public $groupflag = NULL;

    /**
     * Stores args for used groups
     * 
     * @type array
     * */
    public $groups = array();

    /**
     * Flag used to save fields to tabs (jqueryUI)
     * 
     * @type string id of tabgroup
     * */
    public $tabflag = NULL;

    /**
     * Stores args for every tabgroup
     * 
     * @type array
     * */
    public $tabs = array();

    /**
     * Flag used to save fields to a section
     * 
     * @type string id of section
     * */
    public $sectionflag = false;

    /**
     * Stores args for sections
     * 
     * @type array
     * */
    public $sections = array();

    /**
     * Constructor
     * Sets some default filters and actions for fields
     * TODO: think about it
     * */
    public function __construct()
    {
        
    }

    public function init()
    {
        
        $this->fieldoptions = get_option( 'kontentfields' );
        add_action( 'kb_before_field', array( __CLASS__, 'standard_before_field' ) );
        add_action( 'kb_after_field', array( __CLASS__, 'standard_after_field' ) );
        add_filter( 'kb_field_wrapper', array( __CLASS__, 'standard_field_wrapper' ), 2, 2 );


        add_action( 'admin_print_styles-post.php', array( __CLASS__, 'admin_print_styles' ) );
        add_action( 'admin_print_styles-post-new.php', array( __CLASS__, 'admin_print_styles' ) );
        add_action( 'admin_print_styles-toplevel_page_kontentblocks-sidebars', array( __CLASS__, 'admin_print_styles' ) );
        add_action( 'admin_print_styles-toplevel_page_kontentblocks-templates', array( __CLASS__, 'admin_print_styles' ) );
        add_action( 'admin_print_styles-toplevel_page_kontentblocks-areas', array( __CLASS__, 'admin_print_styles' ) );

        if ( isset( $_GET[ 'action' ] ) and $_GET[ 'action' ] == 'os_edit_block' )
            add_action( 'admin_print_scripts', array( __CLASS__, 'admin_print_styles' ) );

        if ( isset( $_GET[ 'action' ] ) and $_GET[ 'action' ] == 'tb_edit_dynamic_areas' )
            add_action( 'admin_print_scripts', array( __CLASS__, 'admin_print_styles' ) );

    }

    /**
     * creates a new Instance of the field and stores it in $this->fields for later reference
     * adds action for admin_print_styles if available
     * every field can enqueue its own styles and scripts
     * 
     * @param string $id - field identifier
     * @param object $class - field class
     * */
    public function register_field( $id, $class )
    {
        $this->fields[ $id ] = new $class;

    }

    public static function admin_print_styles(){
        
    wp_enqueue_script('Kontentblocks-Fields', KB_PLUGIN_URL . '/js/dist/fields.min.js', array('jquery', 'backbone', 'underscore', 'wp-color-picker', 'kontentblocks-base'), '0.7' , true);
        
        
    }
    
    /**
     * register a field for the block and store it to $this->collected_fields
     * setup if this field belongs to a section, tabgroup or fieldgroup
     * 
     * @param string $field - field id
     * @param string $key - key for the data as saved to the post meta of the Block
     * @param array $args - like label,tabname, css class
     * 
     * TODO: define field default args
     * @return void
     * */
    public function field( $field, $key, $args = NULL )
    {


        $tabs    = $this->tabflag;
        $section = $this->sectionflag;
        $group   = $this->groupflag;

        $this->collect_fields( $field, $key, $args, $section, $tabs, $group );

    }

    /**
     * loop through $collected_fields and resort/filter 'em to the corresponding sections, tabgroups or fieldgroups
     * This is not pretty but works
     * Further, loop through resorted fields and call corresponding do_section, do_tabs, do_groups method
     * 
     * @return void
     * */
    private function render()
    {

        $saveforlater = array();
        // get collected fields
        $fields       = $this->collected_fields[ $this->classname ];




        foreach ( $fields as $field ):

            // if inside a section
            if ( !empty( $field[ 'section' ] ) ) {

                // if tabs inside section
                if ( !empty( $field[ 'tabs' ] ) ) {
                    // if group inside tabs
                    if ( !empty( $field[ 'group' ] ) ) {
                        // // section -> tabs -> group -> field
                        $saveforlater[ $field[ 'section' ] ][ 'section' ][ $field[ 'tabs' ] ][ 'tabbed' ][ $field[ 'group' ] ][ 'group' ][] = $field;
                        continue;
                    }
                    else {

                        // section->tabs->field
                        $saveforlater[ $field[ 'section' ] ][ 'section' ][ $field[ 'tabs' ] ][ 'tabbed' ][] = $field;
                        continue;
                    }
                }
                else {
                    // section->field
                    $saveforlater[ $field[ 'section' ] ][ 'section' ][ $field[ 'key' ] ][ 'single' ] = $field;
                }

                // end if section is set
                // else no section
            }
            else {
                // no section but tabs     
                // if tabs are set
                if ( !empty( $field[ 'tabs' ] ) ) {
                    // if grou is set
                    if ( !empty( $field[ 'group' ] ) ) {
                        // tabs->tab->group->fields
                        $saveforlater[ $field[ 'tabs' ] ][ 'tabbed' ][ $field[ 'group' ] ][ 'group' ][] = $field;
                        continue;
                    }
                    // tabs->tab->field
                    $saveforlater[ $field[ 'tabs' ] ][ 'tabbed' ][] = $field;
                    continue;
                }
                else {
                    // no section, no tabs, but group

                    if ( !empty( $field[ 'group' ] ) ) {
                        // groupid->group->field
                        $saveforlater[ $field[ 'group' ] ][ 'group' ][] = $field;
                    }
                    else {
                        // no tabs, just single field
                        // fieldkey->field
                        $saveforlater[ $field[ 'key' ] ][ 'single' ] = $field;
                    }
                }
            }

        endforeach;

        do_action( 'before_fields_output', $fields );


        // Resorting done, now send them to the right methods
        foreach ( $saveforlater as $item => $contents ) {


            // its a group, do_group
            if ( !empty( $contents[ 'group' ] ) && $contents[ 'group' ] ) {
                $this->do_group( $item, $contents[ 'group' ] );
            }
            // section going on, do_section
            else if ( !empty( $contents[ 'section' ] ) && $contents[ 'section' ] ) {
                $this->do_section( $item, $contents[ 'section' ] );
            }
            // there are tabs, do_tabs
            else if ( !empty( $contents[ 'tabbed' ] ) && $contents[ 'tabbed' ] ) {
                $this->do_tabs( $item, $contents[ 'tabbed' ] );
            }
            // just a single field, just output
            else if ( $contents[ 'single' ] ) {
                $this->output_field( $contents[ 'single' ] );
            }
        }
        //$this->collected_fields[$this->classname] = array();
        do_action( 'after_fields_output', $fields );

        $this->collected_fields = array();

    }

    /**
     * Create markup for jqueryUI Tabs
     * If there fieldgroups inside a tab, fields get send to do_group, output field if it is a single
     * 
     * @param string $id - id of tabgroup
     * @param array $tabbed - fields inside this tabgroup
     * */
    private function do_tabs( $id, $tabbed )
    {

        // Get 'settings' for this tabgroup
        $tabs = $this->tabs[ $id ];

        // currently no styles available, but prepared for vertical tab navigation
        $vertical = ($tabs[ 'vertical' ] == true) ? 'vertical' : '';

        echo "<div class='{$vertical} kb_fieldtabs'>";
        echo "<ul>";

        foreach ( $tabbed as $field => $con ) {

            // if it's a fieldgroup, generate the tabname and id from the group settings
            if ( !empty( $con[ 'group' ] ) && $con[ 'group' ] ) {
                $group = $this->groups[ $field ];
                $name  = (!empty( $group[ 'tabname' ] )) ? $group[ 'tabname' ] : 'GroupTab seeks name';
                $id    = $this->get_field_id( $field ) . '_tab';
                echo "<li><a href='#{$id}'>{$name}</a></li>";
            }
            else {
                // get tabname from field settings
                $name = (!empty( $con[ 'args' ][ 'tabname' ] )) ? $con[ 'args' ][ 'tabname' ] : $con[ 'args' ][ 'label' ];

                // no name -> default name
                if ( empty( $name ) ) {
                    $name = 'Tab needs Name';
                }

                $id = $this->get_field_id( $con[ 'key' ] ) . '_tab';
                echo "<li><a href='#{$id}'>{$name}</a></li>";
            }
        }

        echo "</ul>";

        foreach ( $tabbed as $field => $con ) {

            // same as above, generate container id from group settings
            // if it's a group, send the fields to do_group
            if ( !empty( $con[ 'group' ] ) && $con[ 'group' ] ) {
                $id = $this->get_field_id( $field ) . '_tab';
                echo "<div id='{$id}'>";
                // output fields inside this group
                $this->do_group( $field, $con[ 'group' ] );
                echo "</div>";
            }
            else {
                // it's a single field, call output
                // container settings based on field settings
                $id = $this->get_field_id( $con[ 'key' ] ) . '_tab';
                echo "<div id='{$id}'>";
                $this->output_field( $con );
                echo "</div>";
            }
        }
        echo "</div>";

    }

    /**
     * Generates Markup for fieldgroups
     * 
     * @param string $id - id of fieldgroup
     * @param array $fields - fields inside this group
     * */
    private function do_group( $id, $fields )
    {
        //get group settings, title and desc. by now
        $group = $this->groups[ $id ];
        echo "<div class='{$group[ 'class' ]}'>";

        // group header, no title = no header
        if ( !empty( $group[ 'title' ] ) ) {
            echo "<div class='kb_group_header'>
                    <h2>{$group[ 'title' ]}</h2>
                    <p class='description'>{$group[ 'description' ]}</p>  
                  </div>";
        }

        foreach ( $fields as $field ) {
            $this->output_field( $field );
        }
        echo "</div>";

    }

    /**
     * Generate markup for sections and call the appropiate method for (optional) tabgroups, fieldgroups
     * 
     * @param string $id
     * @param array $contents 
     */
    private function do_section( $id, $contents )
    {
        // get settings, title and desc. by now
        $section = $this->sections[ $id ];

        echo "	<div class='kb_fieldsection'>
					<div class='kb_fieldsection_header'>
						<h2>{$section[ 'title' ]}</h2>";

        if ( !empty( $section[ 'description' ] ) ) {
            echo "<p class='description'>{$section[ 'description' ]}</p>";
        }

        echo "		</div>";

        foreach ( $contents as $key => $content ) {

            if ( !empty( $content[ 'tabbed' ] ) && $content[ 'tabbed' ] ) {
                // i see tabs, do_tabs
                $this->do_tabs( $key, $content[ 'tabbed' ] );
            }
            else if ( !empty( $content[ 'group' ] ) && $content[ 'group' ] ) {
                // looks like a group, do_group
                $this->do_group( $key, $content[ 'group' ] );
            }
            else if ( !empty( $content[ 'single' ] ) && $content[ 'single' ] ) {
                // a single field...just output
                $this->output_field( $content[ 'single' ] );
            }
        }

        echo "</div>";

    }

    /**
     * Output method for each field
     * calls action and filters for fields depending on context
     * TODO: really really rethink filters and actions, there is no concept yet
     * 
     * @param array $field - field to output
     * */
    private function output_field( $field )
    {
        // setup;
        $this->instance = $this->fields[ $field[ 'field' ] ];
        if ( !$this->instance )
            return;

        $this->instance->key      = $field[ 'key' ];
        $this->instance->blockid  = $this->blockid;
        $this->instance->data     = (!empty( $this->data[ $field[ 'key' ] ] )) ? $this->data[ $field[ 'key' ] ] : '';
        $this->instance->settings = $field[ 'args' ];

        if ( $this->parent ) {
            if ( $this->parent->area_context )
                $this->instance->area_context = $this->parent->area_context;

            $this->instance->page_template = (!empty( $this->parent->page_template )) ? $this->parent->page_template : null;
        }

        do_action( 'kb_before_field', $field );
        do_action( "kb_before_{$field[ 'field' ]}" );


        $output = $this->instance->html( $field[ 'key' ], $field[ 'args' ], $this->data );

        $html = apply_filters( "{$field[ 'field' ]}_html", $field[ 'key' ], $field[ 'args' ], $this->data );

        $html = apply_filters( 'kb_field_html', $output );

        $html = apply_filters( "{$this->classname}_{$field[ 'field' ]}", $html );

        $html = apply_filters( 'kb_field_wrapper', $output, $field[ 'args' ][ 'wrapper' ] );



        echo '<div class="kb_field_header">';
        if ( !empty( $field[ 'args' ][ 'title' ] ) )
            echo "<h4>{$field[ 'args' ][ 'title' ]}</h4>";
        echo '</div>';


        echo $html;

        echo '<div class="kb_field_footer">';
        echo '</div>';

        do_action( 'kb_after_field' );
        do_action( "kb_after_{$field[ 'field' ]}" );

    }

    /**
     * Collect fields
     * 
     * @param string $field - field id
     * @param string $key - key for post meta array
     * @param array $args - various settings for the field
     * @param string $section - if inside a section, set to section id
     * @param string $tabs - if inside a tabgroup, set to tabgroup id
     * @param string $group - if inside a fieldgroup, set to fieldgroup id
     * */
    private function collect_fields( $field, $key, $args = NULL, $section = NULL, $tabs = false, $group = NULL )
    {

        // default args 
        $defaults = array
            (
            'label' => '',
            'class' => '',
            'title' => '',
            'description' => '',
            'std' => '',
            'wrapper' => null,
            'array' => false,
            'akey' => false,
            'multiple' => false
        );

        $merged = wp_parse_args( $args, $defaults );

        if ( isset( $args[ 'array' ] ) && is_string( $args[ 'array' ] ) ) {
            if ( empty( $this->collected_fields[ $this->classname ][ $key . '_' . $args[ 'array' ] ] ) ) {
                $this->collected_fields[ $this->classname ][ $key . '_' . $args[ 'array' ] ] = array
                    (
                    'field' => $field,
                    'key' => $key,
                    'args' => $merged,
                    'section' => $section,
                    'tabs' => $tabs,
                    'group' => $group
                );
            }
        }
        elseif ( empty( $this->collected_fields[ $this->classname ][ $key ] ) ) {
            $this->collected_fields[ $this->classname ][ $key ] = array
                (
                'field' => $field,
                'key' => $key,
                'args' => $merged,
                'section' => $section,
                'tabs' => $tabs,
                'group' => $group
            );
        }

    }

    /**
     * Setup basic data to be used with the calling Block
     * 
     * @param string $classname - reference to the Blockclass
     * @param string $blockid - unique id for the block and prefix for fields
     * @param array $data - stored data for the Block 
     * 
     * @return void
     * */
    public function setup( $parent, $blockid, $data )
    {


        // for backwards compatibility
        if ( !is_object( $parent ) ) {
            $parent          = null;
            $this->classname = $parent;
        }

        $this->parent    = $parent;
        $this->classname = get_class( $parent );
        $this->blockid   = $blockid;
        $this->data      = $this->sanitize_data( $data );

    }

    /**
     * To be called after all field calls to store collected fields inside an option
     * Calls render() which does the actual work
     * 
     * */
    public function done()
    {

        $exist = maybe_unserialize( get_option( 'kontentfields' ) );
        $new   = $this->collected_fields;

        if ( empty( $new ) )
            return false;


        if ( !empty( $exist ) && is_array( $exist ) ) {
            $save = array_merge( $exist, $new );
        }
        else {
            $save = $new;
        }
        if ( $save != $exist )
            update_option( 'kontentfields', $save );


        $this->render();

    }

    /**
     * Loop through the fields for this Block and do (optional) filter to do stuff with the field data from $_POST resp. Block data
     * Can be used to sanitize or validate input data.
     * If filter returns false, which may be useful when saving is done via ajax (plupload i.e), the old/existing data for this field gets returned
     * 
     * @param array $old - old data 
     * */
    public function save( $old )
    {
        if ( !isset( $this->fieldoptions[ $this->classname ] ) )
            return false;

        $fields = $this->fieldoptions[ $this->classname ];

        if ( empty( $fields ) )
            return false;

        $return = array();

        foreach ( $fields as $field ) {

            $old      = (!empty( $old[ $field[ 'key' ] ] )) ? $old[ $field[ 'key' ] ] : '';
            $filtered = null;


            if ( !empty( $this->data[ $field[ 'key' ] ] ) ) {

                $filtered = apply_filters( "kb_pre_save_field_{$field[ 'field' ]}", $this->data[ $field[ 'key' ] ] );
            }


            if ( false === $filtered ) {
                $return[ $field[ 'key' ] ] = $old[ $field[ 'key' ] ];
            }
            else {
                $return[ $field[ 'key' ] ] = $filtered;
            }
        }
        return wp_parse_args( $return, $this->data );

    }

    /**
     * Calls a filter for each field to output data to the frontend
     * TODO: rethink how useful this is
     * */
    public function output()
    {
        $fields = $this->fieldoptions[ $this->classname ];

        foreach ( $fields as $field ) {

            $output = apply_filters( "kb_output_field_{$field[ 'field' ]}", $this->data[ $field[ 'key' ] ] );

            return $output;
        }

    }

    /**
     * Experimental: If fields would have a default frontend output
     * something like this could be used to make things easier inside the block() method of each block
     * instead of creating everything from scratch, simply call Kontentfields->do_field()
     * 
     * @param string $field
     * @param string $key 
     */
    public function do_field( $field, $key )
    {
        $output = apply_filters( "kb_output_field_{$field}", $this->data[ $key ] );
        $output = apply_filters( "{$this->classname}_field_{$field}", $output );
        echo $output;

    }

    /* ---------------------------------------------------------
     * Helper functions
     */

    public static function standard_before_field( $field )
    {
        echo "<div class='kb_field {$field[ 'field' ]} clearfix'>";

    }

    public static function standard_after_field()
    {
        echo '</div>';

    }

    /**
     * Set $sectionflag to id, store section args
     * Id just has to be unique
     * 
     * @param string $id
     * @param string $title
     * @param string $description 
     */
    public function section_open( $id, $title = '', $description = '' )
    {
        $this->sectionflag     = $id;
        $this->sections[ $id ] = array(
            'title' => $title,
            'description' => $description
        );

    }

    /**
     * reset sectionflag to NULL 
     */
    public function section_close()
    {
        $this->sectionflag = NULL;

    }

    /**
     * Set $tabflag to id, store tab settings
     * 
     * @param string $id
     * @param array $args
     * TODO: defaults. 
     */
    public function start_tabs( $id, $args = NULL )
    {
        $this->tabflag     = $id;
        $this->tabs[ $id ] = $args;

    }

    /**
     *  Reset $tabflag to NULL 
     */
    public function end_tabs()
    {
        $this->tabflag = NULL;

    }

    /**
     * Set $groupflag to id, store group settings
     * 
     * @param string $id
     * @param array $args 
     */
    public function start_group( $id, $args )
    {
        $this->groupflag = $id;

        $defaults = array(
            'class' => '',
            'tabname' => 'untitled',
            'title' => '',
            'description' => ''
        );

        $args = wp_parse_args( $args, $defaults );

        $this->groups[ $id ] = $args;

    }

    /**
     * Reset $groupflag to NULL
     * */
    public function end_group()
    {
        $this->groupflag = NULL;

    }

    /**
     * Experimental filter, if a fields has wrapper settings, this will happen
     * 
     * @param string $html
     * @param array $wrapper
     * @return string  
     */
    public static function standard_field_wrapper( $html, $wrapper )
    {

        $out = '';
        $out.= $wrapper[ 'before' ];
        $out.= $html;
        $out.= $wrapper[ 'after' ];

        return $out;

    }

    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * */
    public function get_field_id( $key, $rnd = false )
    {
        if ( $rnd ) {
            $number = rand( 1, 9999 );
            $id     = $this->blockid . '_' . $key . '_' . $number;
        }
        else {
            $id = $this->blockid . '_' . $key;
        }


        //$id = str_replace(array('-','_'), '', $id);
        return $id;

    }

    /*
     * Helper to standardize the widget title
     */

    public function _get_widget_title( $default = '' )
    {
        return $this->field
                (
                'text', 'widget_title', array(
                'label' => 'Sidebar Titel',
                'description' => 'Module in der Seitenleiste können einen optionalen, vorangestellten Titel haben (optional)',
                'std' => $default
                )
        );

    }

    public function sanitize_data( $data )
    {
        if ( !empty( $data ) ) {
            foreach ( $data as $key => $value ) {
                if ( $value === 'true' ) {
                    $data[ $key ] = true;
                }
                else if ( $value === 'false' ) {
                    $data[ $key ] = false;
                }
            }
        }
        return $data;

    }

}
