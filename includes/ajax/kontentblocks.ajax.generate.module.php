<?php

add_action( 'wp_ajax_kb_generate_blocks', 'KB_Ajax_Generate_Module::get_instance' );

final class KB_Ajax_Generate_Module
{

    /**
     * $instance
     */
    protected static $instance = null;

    /**
     * $post_id
     * current post id
     * @var integer
     */
    private $post_id = null;

    /**
     * $type
     * type of module
     * @var string
     */
    private $type = null;

    /**
     * $count
     * current module count
     * @var integer
     */
    private $count = null;

    /**
     * $area
     * target area
     * @var string
     */
    private $area = null;

    /**
     * $template
     * if module originates from template, template id
     * else false
     * @var bool
     */
    private $template = false;

    /**
     * $master
     * originates from master templat
     * @var bool
     */
    private $master = false;

    /**
     * $post type
     * current post type
     * @var string
     */
    private $post_type = 'page';

    /**
     * $page_template
     * current page template
     * @var string
     */
    private $page_template = 'default';

    /**
     * $duplicate
     * indicates if this is a duplicate
     * @var bool
     */
    private $duplicate = false;

    /**
     * $modules
     * moduels of current post
     * @var array
     */
    private $modules;

    /**
     * $module
     * holds the instance of the module to create
     * @var object
     */
    private $module;

    /**
     * $new_id
     * holds the new id for the created module
     * @var string
     */
    private $new_id;

    /**
     * $new_module
     * Array of data for the new module
     * @var array
     */
    private $new_module;

    /**
     * get instance
     * singleton patter
     * @return object
     */
    public function get_instance()
    {
        // create an object
        NULL === self::$instance and self::$instance = new self;

        return self::$instance;

    }

    /**
     * Init Method
     * @return void
     */
    private function __construct()
    {
        // TODO: validate request
        //define constant while working
        if ( !defined( 'KB_GENERATE' ) ) {
            define( 'KB_GENERATE', true );
        }

        // setup $_POST data
        $this->setupData();

    }

    /*
     * Setup $_POST Data
     * sets class properties
     * 
     * data array should match properties
     * If any of the method calls fail validation, wp_send_json_error gets fired
     * and the Action exits.
     * No errors or unset data allowed. 
     */

    private function setupData()
    {
        // no data, bail!
        if ( !isset( $_POST[ 'data' ] ) )
            wp_send_json_error();

        // Setup Post keys to propeties
        foreach ( $_POST[ 'data' ] as $key => $value ) {
            $this->$key = $this->_sanitizeKey( $key, $value );
        }

        // Bail if post id is not set
        if ( !$this->post_id )
            wp_send_json_error( 'Post ID missing' );

        // get existing modules reference
        $this->modules = get_post_meta( $this->post_id, 'kb_kontentblocks', true );

        // Override Class / type if this originates from a master template
        if ( $this->master )
            $this->type = 'KB_Master_Module';

        // update counter
        $this->count = $this->_updateCount();

        // No Error until this point, get module instance and proceed
        $this->module = $this->setupModule();

        // Set new id
        $this->new_id = $this->_setNewId();

        //prepare new block
        $this->new_module = $this->prepareNewModule();

        // Save data
        $this->updateData();

    }

    /**
     * Setup Module
     * 
     * instantiate the module and setup
     * @global $Kontentblocks
     */
    private function setupModule()
    {
        global $Kontentblocks;

        $module = FALSE;

        // get module instance from factory
        if ( class_exists( $this->type ) )
            $module = new $Kontentblocks->blocks[ $this->type ];
        else
            wp_send_json_error( $this->type . ' does not exist' );


        //You are still with me, proceed
        return $module;

    }

    /**
     * Sanitize and Validate Key
     * 
     * will convert literals to boolean values
     * or return strings
     * 
     * Since none of this data should contain empty values
     * bail out if something is not set
     * 
     * @param string $key
     * @param mixed $value
     * @return mixed
     */
    private function _sanitizeKey( $key, $value )
    {


        if ( $value === 'true' )
            return true;

        if ( $value === 'false' )
            return false;

        if ( !isset( $value ) )
            wp_send_json_error( $key . 'is not set' );

        return $value;

    }

    /**
     * Update Count
     * 
     * Set the counter as reference for the new module id
     * counting doesn't start with zero
     */
    private function _updateCount()
    {
        $count = $this->count;

        if ( $count != 0 ) {
            $count = $this->count + 1;
        }
        else {
            $count = 1;
        };

        return $count;

    }

    /**
     * Set new Module id
     * 
     * Unique id for new module
     */
    private function _setNewId()
    {
        $prefix = apply_filters( 'kb_post_module_prefix', 'module-' );
        return $prefix . $this->post_id . '_' . $this->count;

    }

    /**
     * Prepare new Module
     */
    private function prepareNewModule()
    {
        global $Kontentblocks;

        // prepare new block data
        $new_module = array(
            'id' => $this->module->id,
            'instance_id' => $this->new_id,
            'area' => $this->area,
            'class' => $this->type,
            'name' => $this->module->settings[ 'public_name' ],
            'status' => '',
            'draft' => 'true',
            'locked' => 'false',
            'area_context' => $this->context,
            'master' => $this->master,
            'master_ref' => ($this->master) ? $this->template : false
        );

        if ( $this->template ) {
            $tpl = $Kontentblocks->get_block_template( $this->template );
            if ( $tpl ) {
                $new_module[ 'name' ] = $tpl[ 'name' ];
            }
        }


        $new_module = apply_filters( 'kb_modify_new_module', $new_module );

        return $new_module;

    }

    /**
     * Update Data
     * If something goes wrong each method might fire wp_send_json_error
     */
    private function updateData()
    {
        //update module
        $this->module->set( $this->new_module );

        //save module to reference array
        $this->saveNewModule();

        // handle template generation
        $this->handleTemplates();

        // handle duplicates
        $this->handleDuplicate();

        $this->render();

    }

    /**
     * Save new module to post meta
     */
    private function saveNewModule()
    {
        // add new block and update 
        $this->modules[ $this->new_id ] = $this->new_module;
        $update                       = update_post_meta( $this->post_id, 'kb_kontentblocks', $this->modules );

        if ( !$update )
            wp_send_json_error( 'Saving not successful!' );

    }

    /**
     * Handle generation from Template
     */
    private function handleTemplates()
    {
        //create data for templates
        if ( $this->template ) {
            $master_data = get_option( $this->template );
            $update      = update_post_meta( $this->post_id, '_' . $this->new_id, $master_data );

            if ( !$update )
                wp_send_json_error( 'Upddate not successful' );
        }

    }

    /**
     * Handle generation of duplicates
     */
    private function handleDuplicate()
    {

        if ( !empty( $this->duplicate ) ) {
            $master_data = get_post_meta( $this->post_id, '_' . $this->duplicate, true );
            $update      = update_post_meta( $this->post_id, '_' . $this->new_id, $master_data );

            if ( !$update )
                wp_send_json_error( 'Upddate not successful' );
        }

    }

    /**
     * Output result
     */
    private function render()
    {

        if ( empty( $_POST[ 'kbajax' ] ) ) {
            $this->module->_render_options();
        }
        else {
            ob_start();
            $this->module->_render_options( true );
            $html = ob_get_clean();

            $response = array
                (
                'id' => $this->new_id,
                'name' => $this->module->settings[ 'public_name' ],
                'html' => $html
            );

            echo wp_send_json( $response );
            do_action( 'block_added', $this->post_id, $this->new_module );
        }

    }

}
