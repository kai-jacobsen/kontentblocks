<?php
/*
  Plugin Name:Kontentblocks.
  Plugin URI: http://kontentblocks.de
  Description: Content Management on steroids
  Version: 0.7
  Author: Kai Jacobsen
  Author URI: http://kontentblocks.de
  License: Split License / GPL3
 */

if ( ! defined( 'ABSPATH' ) ){ die( 'Direct access not permitted.' ); }

Class Kontentblocks
{
	
	
	public $dev_mode = true;
	
	
	/**
	 * Stores created areas
	 * @var array 
	 */
	public $areas = array( );
	
	/**
	 * Stores a instance for each Block
	 * 
	 * @var array objects 
	 */
	public $blocks = array( );
	
	/**
	 * Stores area settings
	 * 
	 * @var array
	 */
	public $area_settings = array( );
	
	/**
	 * Store Area Templates
	 * 
	 * @var array 
	 */
	public $area_templates = array();
	
	/*
	 * Flag for wrapper usage
	 */
	public $use_wrapper = false;
	
	/*
	 * Default Wrapper Template
	 */
	public $default_wrapper = null;
	
	/*
	 * Array of Roles and Caps used by and for Kontentblocks
	 * 
	 * @var array
	 */
	public $caps = array( );
	
	/**
	 * Set  Post Context
	 * indicates where the data is stored. either post_meta (true) or option(false)
	 * defaults to true, and is set to false if called on option pages 
	 */
	public $post_context = true;
	
	/**
	 * Available Block Templates 
	 */
	public $block_templates = array();
	
	/*
	 * Constructor
	 * Setup constants and include necessary files
	 * 
	 */
	function __construct()
	{
        
		
		/* Define some path constants to make things a bit easier */
		define( 'KB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
		define( 'KB_TEMPLATE_URL', plugin_dir_url( __FILE__ ) . 'modules/' );
		define( 'KB_TEMPLATE_PATH', plugin_dir_path( __FILE__ ) . 'modules/' );
		define( 'KB_CACHE', false);
		define( 'KB_CACHE_INTERVAL', 60*60);
		
		// additional cap feature, only used on demand and not properly tested yet
		define( 'KONTENTLOCK', false);
		
		/* Include all necessary files on admin area */
		if ( is_admin() )
		{
			include_once dirname( __FILE__ ) . '/kontentblocks.options.php';
			include_once dirname( __FILE__ ) . '/kontentblocks.ui.php';
			include_once dirname( __FILE__ ) . '/kontentblocks.ajax.php';
			include_once dirname( __FILE__ ) . '/kontentblocks.helper.php';
			include_once dirname( __FILE__ ) . '/kontentblocks.helper.new.php';
			include_once dirname( __FILE__ ) . '/kontentblocks.class.area.php';
			include_once dirname( __FILE__ ) . '/kontentblocks.class.area.menu.php';
			include_once dirname( __FILE__ ) . '/includes/kontentblocks.sidebar-area-selector.php';

			
			// enqueue styles and scripts where needed
			add_action( 'admin_print_styles-post.php', array( $this, 'enqueue_files' ), 30 );
			add_action( 'admin_print_styles-post-new.php', array( $this, 'enqueue_files' ), 30 );
			add_action( 'admin_print_styles-toplevel_page_kontentblocks-sidebars', array( $this, 'enqueue_files' ), 30 );
			add_action( 'admin_print_styles-toplevel_page_kontentblocks-templates', array( $this, 'enqueue_files' ), 30 );
			add_action( 'admin_print_styles-toplevel_page_kontentblocks-areas', array( $this, 'enqueue_files' ), 30 );
			add_action( 'admin_print_styles-toplevel_page_dynamic_areas', array( $this, 'enqueue_files' ), 30 );
			
			add_action('init', array( $this, 'remove_editor_support' ));
			add_filter('get_media_item_args', array($this, 'readd_submit_button') ,99,1);
			
		}
		// Files used used on front and backend
		require_once dirname( __FILE__ ) . '/kontentblocks.public-api.php';
        require_once dirname( __FILE__ ) . '/vendor/autoload.php';
        require_once dirname( __FILE__ ) . '/kontentblocks.class.twig.php';
        require_once dirname( __FILE__ ) . '/kontentblocks.class.post-meta.php';
        require_once dirname( __FILE__ ) . '/kontentblocks.class.template.php';
		require_once dirname( __FILE__ ) . '/kontentblocks.class.module.php';
		require_once dirname( __FILE__ ) . '/kontentblocks.class.field.php';
        require_once dirname( __FILE__ ) . '/kontentblocks.class.area.render.php';
        require_once dirname( __FILE__ ) . '/kontentblocks.class.module.render.php';
        require_once dirname( __FILE__ ) . '/kontentblocks.class.kontentfields.php';
		require_once dirname( __FILE__ ) . '/includes/options/overlays/kontentblocks.overlay.onsite.edit.php';
		// add theme support
		add_theme_support('kontentblocks');
		

		// Activation Setup
		register_activation_hook( __FILE__, array( $this , '_kontentblocks_activation' ) );
		
		if (is_admin())
		{		
			// load textdomain
			add_action( 'init', array( $this , 'kb_l18n' ) );
            
		}
		// setup vars
		add_action( 'init', array( $this , '_set_block_templates'),850);
		
		// Add Caps to new blogs on a MU installation
		add_action( 'wpmu_new_blog', array ( $this , '_add_caps_to_new_blog'),99,5);
		
		// Frontend On-Site Editing
		add_action( 'init', array( $this , '_on_site_editing_setup'));
		
		// load Templates automatically
		add_action( 'init', array( $this , '_load_templates' ),9 );
		
		// Load Plugins
		add_action( 'init', array( $this, '_load_plugins'), 9 );
		
		// new ui
		add_action( 'init', array( $this, '_add_ui'),99);
		
		// Setup Capability array to work with
		$this->caps = array
		(
			'administrator' => array
			(
				'admin_kontentblocks', // can do everything
				'manage_kontentblocks', // can do all block related actions
				'edit_kontentblocks', // edit and save contents
				'lock_kontentblocks', // can lock blocks,
				'delete_kontentblocks', // delete single blocks
				'create_kontentblocks', // create new blocks
				'deactivate_kontentblocks', // set a block inactive/active
				'sort_kontentblocks' // sort blocks
			),
			
			'editor' => array
			(
				'manage_kontentblocks',
				'edit_kontentblocks',
				'deactivate_kontentblocks',
				'sort_kontentblocks',
				'lock_kontentblocks',
				'create_kontentblocks',
				'delete_kontentblocks'
			),
			
			'contributor' => array
			(
				'sort_kontentblocks',
				'create_kontentblocks',
				'delete_kontentblocks'				
			),
			
			'author' => array
			(
				'sort_kontentblocks',
				'create_kontentblocks',
				'delete_kontentblocks'	
			)
		);
		
	}
	
	
	
	function _add_ui()
	{
		if (is_admin())
		{
			global $Kontentbox;
			$Kontentbox = new KB_Meta_Box($this);
            
		}
			
	}
	
	
	
	
	
	/*
	 * Remove Editor from built-in Post Types, Kontentblocks will handle this instead.
	 * above action will remove submit button from media upload as well
	 * uses @filter get_media_item_args to readd the submit button
	 */
	function remove_editor_support() 
	{
		// hidden for pages by default
		if (  apply_filters('kb_remove_editor_page', true))
			remove_post_type_support( 'page', 'editor' );
		

		
		// visible for posts by default
		if ( apply_filters('kb_remove_editor_post', false))
			remove_post_type_support( 'post', 'editor' );
	}
	
	
	
	
	// re-adds the submit button to the media upload 
	function readd_submit_button($args)
	{
		$args['send'] = true;
			return $args;
	}
	
	
	
	
	
	/**
	 * Enqueue all styles and scripts
	 * Array for localization strings used by JS actions
	 * TODO: complete l18n strings, develop nameing scheme
	 */
	function enqueue_files()
	{
		global $Kontentblocks, $is_IE;
	
		// Translation String pushed to the dom as global js object
		$kb_l18n_strings = array(
			
			// security messages
			'sec_no_permission'		=> __( 'You don\'t have the right permission for this action','kontentblocks'),
			'sec_nonce_failed'		=> __( 'Nonce is not set, Request stopped', 'kontentblocks'),
			
			// area messages
			'area_create_full'		=> __( 'The limit for this Area has been reached. You first have to delete one block to add a new one', 'kontentblocks' ),
			'area_sort_full'		=> __( 'Delete one block in order to add a new one', 'kontentblocks' ),
			'area_block_not_allowed'		=> __( 'This Block is not allowed in this area', 'kontentblocks'),
			
			//block messages
			'block_delete'			=> __( 'This will delete the Block permanently. Are you sure?', 'kontentblocks' ),
			'block_resorting'		=> __( 'Blocks have been resorted', 'kontentblocks' ),
			'block_deleted_and_data'=> __( 'Block and meta data has been sucessfully deleted', 'kontentblocks' ),
			'block_deleted'			=> __( 'Block has been sucessfully deleted. There was no saved data to remove.', 'kontentblocks' ),
			'block_delete_error'	=> __( 'Oh oh, an error. This shouldn\'t happen', 'kontentblocks' ),
			'block_deactivated'		=> __( 'Block has been deactivated.', 'kontentblocks' ),
			'block_reactivated'		=> __( 'Block is active again.', 'kontentblocks' ),
			'block_locked'			=> __( 'Block has been locked', 'kontentblocks' ),
			'block_unlocked'		=> __( 'Block has been unlocked', 'kontentblocks' ),
			'block_disabled_delete'	=> __( 'This Block is disabled and cannot be deleted.', 'kontentblocks' ),
			'block_disabled_status' => __( 'Block is disabled, status cannot be changed', 'kontentblocks' ),
			'block_duplicate'		=> __( 'If you have unsaved changes, please update first. Duplicate Module?', 'kontentblocks'),
			'block_duplicate_success' => __( 'Successfully duplicated.', 'kontentblocks' )
		);
		
		//Caps for the current user as global js object
		
		$current_user = wp_get_current_user();
		$roles = $current_user->roles;
		
		// get caps from options
		$option = get_option('kontentblocks_capabilities');
		
		// if, for some reason, caps not set, fallback to defaults
		$setup_caps = ( ! empty($option)) ? $option : $Kontentblocks->caps;
		
		// prepare cap collection for current user
		$caps = array();
		if (is_array($roles))
		{
			foreach ($roles as $role)
			{
				if ( ! empty($setup_caps[$role]))
				{
					foreach($setup_caps[$role] as $cap)
					{
						$caps[] = $cap;
					}
				}
			}
		}
		
		// Setup the global js object base
		$object = array
		(
			'l18n' => $kb_l18n_strings,
			'caps' => $caps
		);

		// enqueue scripts
		if ( is_admin() )
		{

			// Main Stylesheet
			wp_enqueue_style( 'kontentblocks-base', 
                KB_PLUGIN_URL . 'css/kontentblocks.css' );

			// Stylesheet for JQuery Chosen
			wp_enqueue_style( 'chosen_styles', 
                KB_PLUGIN_URL . 'css/chosen.css' );

			// Plugins - Chosen, Noty, Sortable Touch
			wp_enqueue_script( 'kb_plugins', 
                KB_PLUGIN_URL . 'js/kb_plugins.js' );
			
			// Main Kontentblocks script file
			wp_enqueue_script( 'kontentblocks-base', 
                KB_PLUGIN_URL . 'js/kontentblocks.js', 
                array( 'jquery-ui-core', 
                    'jquery-ui-sortable', 
                    'jquery-ui-tabs', 
                    'jquery-ui-mouse' ) );
			

			// add Kontentblocks l18n strings
			wp_localize_script( 'kontentblocks-base', 'kontentblocks', $object );
		}
		
		if ($is_IE)
		{
			wp_enqueue_script('respond', 
                KB_PLUGIN_URL . 'js/respond.min.js', 
                null, 
                true, 
                true);
            
			wp_enqueue_style('ie8css', KB_PLUGIN_URL . 'css/ie8css.css');
		}
		
		do_action('kb_enqueue_files');
		
	}
	
	
	
	
	
	/*
	 * When a new multisite site gets generated, make sure caps are set
	 */
	function _add_caps_to_new_blog($blog_id)
	{
		switch_to_blog($blog_id);
		$this->_setup_capabilities();
		restore_current_blog();
	}
	
	
	
	

	/**
	 * Activation Wrapper 
	 */
	public function _kontentblocks_activation()
	{
		// setup capabilities
		$this->_setup_capabilities();
	}
	
	
	
	
	
	/**
	 * Indicate whether we are on a post edit screen or inside the dynamic areas section
	 * 
	 * @param bool $bool . defaults to true 
	 * @return void
	 */
	public function set_post_context($bool)
	{
		$this->post_context = $bool;
	}
	
	
	
	
	
	/**
	 * Add capabilities to roles
	 * 
	 * This is a one-time action and happens on plugin activation
	 * Caps can be edited on the corresponding plugin menu page
	 * 
	 * @return void
	 */
	public function _setup_capabilities()
	{
		$kbcaps = $this->caps;
		$options = get_option('kontentblocks_capabilities');
		
		if (empty($options))
			update_option('kontentblocks_capabilities', $kbcaps);
		
		$caps = ( empty($options)) ? $kbcaps : $options;
		
		foreach ($caps as $role => $set)
		{
			$object = get_role($role);
			foreach($set as $cap)
			{
				$object->add_cap($cap);
			}
			$object = NULL;
		}
		
		
	}
	
	
	
	
	/*
	 * Kontentblocks Plugin Textdomain
	 * Setup textdomain
	 * 
	 * @return void
	 */
	public function kb_l18n()
	{
		load_plugin_textdomain( 'kontentblocks', false, dirname( plugin_basename( __FILE__ ) ) . '/language/' );
	}

	
	
	
	
	/**
	 * Load (Block)Template Files
	 * Simply auto-includes all .php files inside the templates folder
	 * 
	 * uses filter: kb_template_paths to register / modify path array from the outside
	 * 
	 * TODO: Some Kind of verification and/or switch to meta data usage
	 */
	public function _load_templates()
	{
		$paths = array(KB_TEMPLATE_PATH);
		$paths = apply_filters('kb_add_template_path', $paths);
		$paths = apply_filters('kb_add_module_path', $paths);
		foreach($paths as $path)
		{

			$dirs = glob($path . '_*', GLOB_ONLYDIR);
			
			if (!empty($dirs))
			{
				foreach($dirs as $subdir)
				{
					$files = glob( $subdir . '/*.php');
                    
					foreach ( $files as $template )
					{
                        if ( strpos( basename(   $template), '__' ) === false)
                            include_once($template);
					}
				}
			}
			
				$files = glob( $path . '*.php');
				foreach ( $files as $template )
				{
                    if ( strpos( basename(   $template), '__' ) === false)
					include_once($template);
				}
			}
			
		do_action('kb_load_templates');
	}
	
	
	/**
	 * Load Plugins to extend certain functionalities
	 * @since 0.8
	 */
		public function _load_plugins()
		{
			$paths = array(  kb_get_plugin_path() );
            $paths[] = plugin_dir_path( __FILE__) . '/helper/';
			$paths = apply_filters('kb_add_plugin_path', $paths);

			foreach($paths as $path)
			{
				$files = glob( $path . '*.php');

				foreach ( $files as $template )
				{

					include_once($template);
				}
			}
			
			do_action('kontentblocks_init');
		}
	
	

	/*
	 * Instantiate a Block Class and store it
	 * Each Block registers itself by using kb_register_blocks which calls this method
	 * 
	 * @param string classname
	 */
	public function register_block($classname)
	{
		
		if (!class_exists($classname))
			return;
		
		if (is_admin())
		{
			$this->blocks[$classname] = new $classname;
		}
		else
		{
			$this->blocks[$classname] = $classname;
		}				
	}
	
	
	
	
	/*
	 * Defaul wrapper template
	 */
	public function register_wrapper($area_template)
	{
		$this->use_wrapper = true;
		$this->default_wrapper = $area_template;
	}
	
	
	
	
	/*
	 * Setup Blocks takes arrays of block data and returns objects
	 */
	public function _setup_blocks($blocks)
	{
		if (empty($blocks))
			return false;
		
		$defaults = array(
			'id'			=> 'generic_id',
			'instance_id'	=> null,
			'area'			=> 'kontentblocks',
			'class'			=> null,
			'name'			=> null,
			'status'		=> 'kb_active',
			'draft'			=> 'pain',
			'locked'		=> false,
			'area_context'	=> 'normal'
		);
		
		
		foreach ( (array)$blocks as $block)
		{
			
			$args = wp_parse_args( $block, $defaults);
			
			$block = apply_filters('kb_modify_block', $block);
			$block = apply_filters("kb_modify_block_{$block['id']}", $block);
			
			if (!class_exists($args['class']) or empty($this->blocks[$args['class']]))
				continue;
			
			// new instance
			$instance = new $args['class']($args['id'], $args['name'], $args);
			
			$instance->set_status($args['status']);
			$instance->set_draft($args['draft']);
			$instance->set_area($args['area']);
			
			foreach ($args as $k => $v)
				$instance->$k = $v;
			
			$collection[] = $instance;
		}
		return $collection;
	}

	/**
	 * Prepare new area
	 * two ways to go:
	 *
	 * if KB is in dev_mode, data gets handled by code and any saved data gets ignored
	 * if KB is not in dev mode, initial setup happens just once, further editing of areas happens by the plugin menu page
	 * 
	 * @param array $args
	 * @return array
	 */
	public function register_area($args, $manual = true)
	{
		
		$defaults = array(
			'id'				=> '', // unique id of area
			'name'				=> '', // public shown name
			'description'		=> '', // public description
			'before_area'		=> '<div id="%s" class="kb_area %s">', //default wrapper markup
			'after_area'		=> '</div>',
			'post_type'			=> array(), // array of post types where this area is available to
			'page_template'		=> array(), // array of page template names where this area is available to
			'available_blocks'	=> array(), // array of classnames
			'area_templates'	=> array(), // array of area template ids
			'dynamic'			=> false, // whether this is an dynamic area
			'manual'			=> $manual, // true if set by code
			'block_limit'		=> '0', // how many blocks are allowed
			'order'				=> 0, // order index for sorting
			'dev_mode'			=> false, // deprecated
			'context'			=> 'normal', // where on the edit screen
			'belongs_to'		=> __('Pages', 'kontentblocks') // internal identification, sorting helper
		);
		
		if (!empty($args['id']))
		{
			$args['id'] = sanitize_title($args['id']);
		}
		// merge defaults with provided args
		$area = wp_parse_args( $args, $defaults );

		// options only gets updated if area does not exist yet
		$needs_update = false;
		
		$registered_areas = $this->areas;

		if ( empty($registered_areas[$area['id']]) )
		{
			$registered_areas[$area['id']] = $area;
		}
		else
		{
			$registered_areas[$area['id']] = wp_parse_args($registered_areas[$area['id']], $area);
		}
		
		$this->areas = $registered_areas;
			

	}
	
    
    
    /**
     * New Experimental Frontend Output factory
     */
	public function render_area($post_id, $area = null, $context = null, $subcontext = null, $args = null, $echo = true)
    {
        
        if (!isset($area))
            return false;

        
        $args = $this->get_area($area);
        
        if (!$args)
            return false;
        
        $Renderer = new KBRender_Area($this,$post_id, $args, $context, $subcontext);
        $output = $Renderer->render($echo);
        return $output;
        
    }
	
	

	/**
	 * Does the actual frontend output work
	 * Calls 'block' method on each Blockclass
	 *
	 * @global object Kontentblocks
	 * @param string post_id
	 * @param string area
	 */
	function render_blocks($post_id = NULL, $area = 'kontentblocks', $context = null, $subcontext = null)
	{
		
		$time_start = microtime();
        $area_template = null;
        
		$areas = $this->get_areas();
		$area_args = $areas[$area];
        
		$this->post_id = $post_id;
        
		
		if (isset( $area_args['dynamic']) && $area_args['dynamic'] == true)
			$this->set_post_context(false);
		

        $pre_element_id = null;
		
		$cached = false;
		if (!isset($areas[$area])) return;
		
		// get references to blocks used
		$blocks = self::get_blocks($post_id, $area, $this->post_context);
		
	
		
		// no blocks, return
		if ( empty( $blocks ) )
			return;

		// get area settings
		$saved_area_settings = get_post_meta( $post_id, 'kb_area_settings', true );
		
        // now we go crazy...if custom is set, we create an area template on the fly
        if (isset($saved_area_settings[$area]['custom']))
            $area_template = $this->_virtual_template($saved_area_settings[$area]['custom']);


        //$last_item_setting = ( !empty( $saved_area_settings[$area]['lastitem'] )) ? (int) $saved_area_settings[$area]['lastitem'] : null ;
		// get the saved settings for this area in use
		$this_area_settings = (! empty($saved_area_settings[$area]) ) ? $saved_area_settings[$area] : null;
        
		// get 'options' for area
		$area_options = $area_args;
		
		// filter blocks for this area, return instances
		$collection = $this->setup_blocks($blocks, $area);
		
		// get information about current page
		$page_template = get_post_meta($post_id, '_wp_page_template', true);
		$post_type = get_post_type($post_id);
		
		// area template

        if (!isset($area_template))
            $area_template = $this->get_area_template($collection, $this_area_settings, $area_options);
		

		if (null !== $area_template and $area_template['id'] != 'default')
		{
			if (!empty($area_template))
			{
				
			$area_template_classes = $this->get_area_template_classes($area_template);
			
			$area_template_columns  = $this->get_area_template_columns($area_template);
			
			// overrides other last-item settings if tpl has one set
			$area_last_item =  $area_template['last-item'];
				if (!empty($area_last_item))
				{
					$last_item_setting = $area_last_item;
				}
			}
		}
		
		
		if ( !empty( $collection ) )
		{
			
			$tmp = $tmpcol = null;
			
			$output = '';
			
			$element_count	= count($collection);

			
			// do area before
			$output .= self::do_area_before($area, $area_options, $this_area_settings, $area_template, $context, $subcontext);
			
			// counter for the .last-item functionality
			$i = 1;
			foreach ( $collection as $instance ) {
				
				
				
			
				// collect block output seperatly and merge it at the end of this loop iteration
				$block = null;
				
				// custom classes | repeater if block before was the same type
				// TODO: Deprecate / concept causes difficulties 
				$element_id = $instance->id;
				if ( $element_id == $pre_element_id) $instance->repeater = true;
					
				// if this block gets wrapped ( area templates ) collect all wrapper classes here
				$wrapperclasses = array();

				// set column property if available
				if (!empty($area_template_columns))
				{
					$tmpcol = array_shift($area_template_columns);
					$instance->columns = $tmpcol;
				}

				if (!empty($area_template))
					$instance->area_template = $area_template['id'];

				// shorthand instance settings
				$settings = $instance->settings;

				// get data
				$data = self::get_data($post_id, $instance, $this->post_context);

				// store data inside class for internal use
				$instance->post_id = $post_id;
				$instance->new_instance = $data;
				$instance->page_template = $page_template;
				$instance->post_type = $post_type;
				// set context
				$instance->context = $context;
				$instance->subcontext = $subcontext;
				$instance->new_instance = $data;
				// call setup method for this instance
				
                if (  method_exists( $instance, 'setup' ))
                    $instance->setup( $instance );
			

				// add wrapper classes as set by area-templates
				if (!empty($area_template_classes))
					{
						$tmp = array_shift($area_template_classes);
						
						$wrapperclasses[] = $tmp;
					}


				if ( isset($last_item_setting)  )
				{
					if ($i % ($last_item_setting) == 0)
					{
						$wrapperclasses[] = 'last-item';								
					}

				}

				// if blocks gets wrapped by area template
				if (!empty($wrapperclasses))
				{
					$block .= self::do_block_before($wrapperclasses);
				}

				// if this blocks uses a wrapper (default behavour), print before markup
				if ( $settings['wrapper'] )
				{							
					// Do widget title if in side context
					// TODO: experimental

					/*if ( $last_item_setting && $last_item_setting != 0 && $i % $last_item_setting == 0 )
					{

						$classestoadd[] = 'last-item';						
					}*/

					//$classestoadd[] = "{$instance->instance_id}";
					$classestoadd[] =  $this->get_element_class($i, $element_count);
					$classestoadd[] =  ($element_id == $pre_element_id) ? ' repeater' : null;

					// add On Site Editor container 
					if (  is_user_logged_in() )
						$classestoadd[] = 'os-edit-container';

					// add classes to markup
					if (!empty($classestoadd))
					{
						$block .= sprintf( stripslashes( $settings['before_block'] ), $instance->instance_id ,implode(' ', $classestoadd) );
					}
					else
					{
						$block .= sprintf( stripslashes( $settings['before_block'] ), NULL );
					}
				}
				// if wrapper is set to false we need a container anyway for os-edit capability
				elseif (  is_user_logged_in() && !$settings['wrapper'])
				{
					$block .= "<div class='os-edit-container'>";
				}

				
                
				// call the actual display method
                if (KB_CACHE === true)
                    $cached = get_transient($instance->instance_id);
                else
                    $cached = false;
				
				if (!isset($cached) || (false == $cached) || (false == $instance->settings['cacheable']) || (KB_CACHE === false))
				{
					
					$html = $instance->block( $data );
					
					

					if ( false === $html)
						continue;
					
					if (is_object($html))
					{
						
						if (  method_exists( $html, 'block' ))
						{
							
							$html = $html->block($html->external_data);
						}
						else
						{
							$html = '';
						}
					}

					set_transient($instance->instance_id, $html, 3600);
					$block .= $html;
					
				}
				else
				{
					$block .= $cached;

				}

                
                if (  method_exists( $instance, 'after' ))
                    $instance->after( $instance );


				if (is_user_logged_in() && current_user_can( 'edit_kontentblocks' ) )
				{
					$block .= $instance->print_edit_link($this->post_id);

				}

				// if block uses wrapper, print after markup
				if ( $instance->settings['wrapper'] )
				{
					$block .= stripslashes( $settings['after_block'] );
				}
				elseif (  is_user_logged_in() && !$settings['wrapper'])
				{
					// close os-edit-container if block doesnt use a wrapper
					$block .= "</div>";
				}
				if (!empty($wrapperclasses))
                {
                    $block .= self::do_block_after($wrapperclasses);
                }					

	
				$i++;
				if (isset($area_template_classes))
					array_push($area_template_classes, $tmp);
				
				if (isset($area_template_columns))
					array_push($area_template_columns, $tmpcol);
				
				// reset to avoid adding up of classes
				$classestoadd = array();
				
				$pre_element_id = $instance->id;
				
				
				// merge to complete output
				$output .= $block;
				
			}// endforeach
			

			// close the area
			$output .= self::do_area_after($area_options);
			
			$time_end = microtime();
			
			//$output .= $time_end - $time_start;
			echo $output;
			} 
			
	}

		
/**
	 * get base id for new blocks
	 * extracts the attached number of every block and returns the highest number found
	 *
	 * @param int
	 */
	static function _get_highest_id($blocks)
	{
		$collect = '';
		if ( !empty( $blocks ) )
		{
			foreach ( $blocks as $block )
					
			{
				$block = maybe_unserialize( $block );
				$count = strrchr( $block['instance_id'], "_" );
				$id = str_replace( '_', '', $count );
				$collect[] = $id;
			}			
		}

		return max( $collect );
	}
	
	/**
	 * Setup Blocks filters blocks for current area and returns array of objects
	 * @param array $blocks
	 * @param string $area
	 * @return array
	 */
	private function setup_blocks($blocks, $area)
	{
		$areablocks = array();
		
		
		
		$blocks = $this->_modify_blocks($blocks);
		
		
		$blocks = $this->_setup_blocks($blocks);
		
		
		
		foreach ( (array)$blocks as $instance )
			{
			
				if ( $instance->area == $area )		
				{
					if (
						$instance->active == false
						OR $instance->draft == 'true'
						OR $instance->settings['disabled'] == true
							)
					{
						
						continue;
					}
					else
					{
						$areablocks[] = $instance;
					}	
				}
				else
				{
					continue;
				}
				
			}
		return $areablocks;
	}
	
	
	
	
	/**
	 * Do area before
	 * @param type $area_options
	 * @param type $this_area_settings
	 * @return type 
	 */
	private static function do_area_before($area, $area_options, $this_area_settings, $area_template, $context, $subcontext)
	{
		$output = '';
		$before_string = stripslashes( $area_options['before_area'] );
		$this_area_settings['classes'] =  null;
		//free additional classes
		if (!empty($this_area_settings['free-classes']))
		{
			$this_area_settings['classes'] = explode (' ', $this_area_settings['free-classes']);
		}
			
		if (!empty($area_template['area-class']))
		{
			$this_area_settings['classes'][] = $area_template['area-class'];
			
		}
			
		$this_area_settings['classes'][] = $context;
		$this_area_settings['classes'][] = $subcontext;
		
		// if there are settings we use them
		if ( !empty( $this_area_settings ) )
		{
			$classes = implode( ' ', $this_area_settings['classes'] );
			
			// insert additional classes to the output
			$output .= sprintf( $before_string, $area, $classes );
		}
		else
		{
			// no additional settings
			$output .= sprintf( $before_string, $area, NULL );
		}
		
		return $output;
	}

	
	/**
	 * Filter  areas from entire areas array
	 * This will actually return all areas, dynamic or not
	 * @param context - string
	 * @return array 
	 */	
	public function get_areas( $context = false) {

		$areas = array();
		$sareas = get_option('kb_registered_areas');
		

		$collection = array_merge( (array)$sareas, $this->areas);
		
		foreach ($collection as $area) 
		{
				if (false != $context)
				{	
					if ($area['context'] === $context)
					{
						$areas[$area['id']] = $area;
					}
				}
				else
				{
					
					$areas[$area['id']] = $area;
				}
		}
		return $areas;
	}
    
    
    /**
     * Get a single area
     */
    public function get_area($area)
    {
        $areas = $this->get_areas();
        
        if (isset($areas[$area]))
            return $areas[$area];
        else
            return false;
		
    }


    /**
	 * Filter dynamic areas from entire areas array
	 * @param context - string
	 * @return array 
	 */	
	public function get_dynamic_areas( $context = false, $exclude = false) {

		$d_areas = array();
		$sareas = get_option('kb_registered_areas');
		

		$collection = array_merge( (array)$sareas, $this->areas);
		
		foreach ($collection as $area) 
		{
			if ($area['dynamic'] && $area['dynamic'] == true)
			{
				if (false != $context)
				{	
					if (in_array($area['context'], (array)$context) )
					{
						$d_areas[$area['id']] = $area;
					}
				}
				elseif (false != $exclude && $area['context'] === $exclude)
				{
					continue;
				}
				else
				{
					$d_areas[$area['id']] = $area;
				}
			}
		}
		return $d_areas;
	}

	/*
	* ------------------------------------------------
	* Area Settings
	* ------------------------------------------------
	*/


	/**
	 *
	 * 
	 * @param array $args 
	 */
		
	public function register_area_settings($args)
	{
		$defaults = array(
			'area_id'		=> '',
			'id'			=> '',
			'type'			=> '',
			'label'			=> '',
			'default'		=> '',
			'description'	=> ''
		);

		$new_settings = wp_parse_args( $args, $defaults );

		if ( ! empty($new_settings['area_id']) )
		{
			$this->area_settings[$new_settings['area_id']][] = $new_settings;
		}
	}
	
	/**
	 * register area template 
	 */

	public function register_area_template($args)
	{
		
		$defaults = array
		(
			'id'		=> '',
			'label'		=> '',
			'layout'	=> array(),
			'last-item' => '',
			'thumbnail' => null
		);
		
		$settings = wp_parse_args($args, $defaults);
		
		if ( !empty($settings['id']))
		{
			$this->area_templates[$settings['id']] = $settings;
		}
	}
	
	/**
	 * Do after area
	 * @param type $area_options
	 * @return type 
	 */
	public static function do_area_after($area_options)
	{
		$output = '';
		$output .= stripslashes( $area_options['after_area'] );
		
		return $output;
	}
	
	/**
	 * Get Blocks
	 * @param string $post_id
	 * @param string $area
	 * @return array
	 */
	public static function get_blocks($post_id, $area, $post_context)
	{
		if (true === $post_context)
		{
			return get_post_meta( $post_id, 'kb_kontentblocks', true );
			
		}
		else
		{
			$dynamic_areas = get_option('kb_dynamic_areas');

			if (!empty($dynamic_areas[$area]))
				return $dynamic_areas[$area];
		}
	}
	
	
	/**
	 * Get block data depending on context
	 * @param string $post_id
	 * @param array $block
	 * @return array 
	 */
	public static function get_data($post_id, $block, $post_context)
	{
		
		if (isset($block->master) && $block->master === true)
			return get_option($block->instance_id);
		
		if ( true === $post_context)
		{
			if ( isset($_GET['preview']) )
			{
				$preview_data = get_post_meta( $post_id, '_preview_' . $block->instance_id, true );
				if ( ! empty($preview_data) )
				{
					return $preview_data;
				}
				else
				{
					return  get_post_meta( $post_id, '_' . $block->instance_id, true );
				}
			}
			else
			{
				return get_post_meta( $post_id, '_' . $block->instance_id, true );
			}			
		}
		else 
		{
			return get_option($block->instance_id);
		}
	}

	public function get_area_template($collection, $this_area_settings, $area_options)
	{
		$area_template = null;
		
		if (!empty($collection))
		{
			$blockcount = count($collection);
			
		
			$assigned_area_templates = (!empty($area_options['area_templates'])) ? $area_options['area_templates'] : null;
			$forced_tpl = (null != $assigned_area_templates) ? $this->get_forced_templates($assigned_area_templates) : null;
			
			if(!empty($forced_tpl))
			{
				foreach ($forced_tpl as $ftpl)
				{
					if (in_array($blockcount, $ftpl['force_by']))
					{
						$area_template = $ftpl;
						
						break;
					}
				}
				
			}
			
			if ($this->use_wrapper)
			{
				if (!empty($this->default_wrapper) && is_array($this->default_wrapper))
				{
					$area_template = $this->default_wrapper;
				}
			}
			
			
			
			if (empty($forced_tpl) or null == $area_template)
			{
				
				$atpl = (!empty($this_area_settings['area_template']) ) ? $this_area_settings['area_template'] : null;
				if (null !== $atpl)
					{
						$area_template = $this->area_templates[$atpl];
						
					}
			}
			
		}
		return $area_template;
		
	}

	public function get_forced_templates($assigned_area_templates)
	{
		$forced_areas = null;
		$settings = array();
		
		if (!empty($assigned_area_templates))
		{
			
			foreach ($assigned_area_templates as $atpl)
			{
				$atpl = (!empty($this->area_templates[$atpl])) ? $this->area_templates[$atpl] : null;
				if ( !empty($atpl['force_by']))
				{
					$forced_areas[] = $atpl;
				}
			}
		}
		
		if( !empty($forced_areas))
		{
			foreach( $forced_areas as $area)
			{
				$settings[$area['id']] = $area; 
			}
		}
		
		return $settings;
		
	}

	/*
	 * Checks for layouts and classes, returns an indexed array of classes
	 */
	public function get_area_template_classes($area_template)
	{
		
		$classes = array();
		
		if (empty($area_template['layout']) or !is_array($area_template['layout']))
			return $classes;
		
		foreach ( $area_template['layout'] as $col )
		{
			if (!empty($col['classes']))
				$classes[] = $col['classes'];
		}
		
		return $classes;
	}
	
	/*
	 * Checks for layouts and columns, returns an indexed array of columns
	 */
	public function get_area_template_columns($area_template)
	{
		$columns = array();
		
		if (empty($area_template['layout']) or !is_array($area_template['layout']))
			return $columns;
		
		foreach ( $area_template['layout'] as $col )
		{
			if (!empty($col['columns']))
			{
				$columns[] = $col['columns'];
			}
			else
			{
				$columns[] = null;
			}
				
		}
		
		return $columns;
	}

	public static function do_block_before($wrapperclasses)
	{
		
		$before = '<div class="%s">';
		$output = sprintf( $before, implode(' ', $wrapperclasses) );
		
		return $output;
	}

	public static function do_block_after()
	{
		return '</div>';
	}
	
	public function _set_block_templates()
	{
		$this->block_templates = get_option('kb_block_templates');
        
	}
	
	public function get_block_templates()
	{
		return $this->block_templates;
	}
	
	public function get_block_template($id)
	{
		$tpls = $this->get_block_templates();
		
		if (isset($tpls[$id]))
			return $tpls[$id];
		else
			return false;
	}

		/**
	 * Retrieve templateable Templates from Block Collection
	 * @return array
	 */
	public function get_templateables()
	{
		$blocks = null;
		
		if (!empty($this->blocks))
		{
			foreach ($this->blocks as $block)
			{
				if (isset($block->settings['templateable']) and $block->settings['templateable'] == true)
				{
					$blocks[] = $block;
				}
			}
		}
		return $blocks;
	}
	
	// Front End editing 
	public function _on_site_editing_setup()
	{
		// Thickbox on front end for logged in users
		
			if (is_user_logged_in() && !is_admin())
			{
				add_action('wp_footer', array($this, 'add_reveal'));
				wp_enqueue_script('KBPlugins', KB_PLUGIN_URL . '/js/kb_plugins.js', array('jquery','jquery-ui-mouse'));
				wp_enqueue_script('KBOnSiteEditing', KB_PLUGIN_URL . '/js/KBOnSiteEditing.js', array('KBPlugins', 'jquery', 'thickbox', 'jquery-ui-mouse'));
				wp_enqueue_style('thickbox');
				wp_enqueue_style('KB', KB_PLUGIN_URL . '/css/kontentblocks.css');
				wp_enqueue_style('KBOsEditStyle', KB_PLUGIN_URL . '/css/KBOsEditStyle.css');
			}
			
			

	}

	function add_reveal()
	{
		echo "<div id='onsite-modal' class='reveal large reveal-modal'>
            <iframe seamless id='osframe' src='' width='100%' height='400'>
            </iframe>
            </div>";
	}
	
	/*
	 * Adds a class to each block of each area for better targeting / styling purposes
	 */
	public function get_element_class($i, $count)
	{
		$class = __return_empty_array();
		
		if ( 1 == $i )
			$class[] = " first-module";
			
		if ( $count == $i )
			$class[] = " last-module";
			
		$class[] = " element-{$i}";
		
		return implode(' ', $class);
		
	}

	public function _modify_blocks( $blocks )
	{
		
		foreach ($blocks as $block => $item)
		{
			
			if (isset($item['master']) && $item['master'] === true)
			{
				$tpls = $this->get_block_templates();
				
				

				$ref = (isset($item['master_ref'])) ? $item['master_ref'] : null;
				
				
				if (empty($ref))
					$ref = get_option($block);

				$args = $tpls[$ref];
				

				$item['class'] = $args['class'];
				$item['instance_id'] = $args['instance_id'];
				$item['dynamic'] = true;
			
				$blocks[$block] = $item;
				
			}

		}
		
		return $blocks;
	}

    public function _virtual_template( $saved_area_settings )
    {
        $columns = explode(',', $saved_area_settings);
        
        foreach($columns as $col)
        {
            $layout[] = array(
                'classes' => $this->_translate_col($col),
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
        
        $test = explode( '.',$col );
        
        if( !empty( $test ) )
            return $this->_translate_col_new( $col );
        
        foreach( str_split($col) as $char )
        {
            
            switch($char)
            {
                case '1';
                  $classes .= 'full';
                break;
            
                case '2';
                  $classes .= 'half';
                break;
            
                case '3';
                  $classes .= 'third';
                break;
            
                case '4';
                  $classes .= 'fourth';
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
        
        
        foreach( explode( '.',$col ) as $chunk )
        {
            
            switch($chunk)
            {
                
                
                case '1';
                  $classes .= 'full';
                break;
            
                case '2';
                  $classes .= 'half';
                break;
            
                case '3';
                  $classes .= 'third';
                break;
            
                case '4';
                  $classes .= 'fourth';
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
}

	// end Kontentblocks



	
	global $Kontentblocks;
	$Kontentblocks = new Kontentblocks();

?>