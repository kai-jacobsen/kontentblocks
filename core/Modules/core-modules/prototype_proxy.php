<?php
//kb_register_block('Proxy');

class Proxy extends \Kontentblocks\Modules\Module {
	
	
	public $post_type;
	public $ID;
	public $area_id;
	public $block_id;	
	
	
	function __construct() {
		
		
		$args = array(
            'public_name'	=> 'Proxy',
            'description'	=> '',
            '_proxy'		=> true,
            'category'		=> 'core',
            'hidden'        => true
		);
		parent::__construct( 'proxy', 'Proxy',$args );
	
		add_action('admin_enqueue_scripts', array( $this, 'enqueue_files'));
		
		add_action('wp_ajax_proxy_get_post_list', array($this, 'get_post_list'));
		add_action('wp_ajax_proxy_get_area_list', array($this, 'get_area_list'));
		add_action('wp_ajax_proxy_get_block_list', array($this, 'get_block_list'));
		add_action('wp_ajax_proxy_get_result', array($this, 'get_result'));
		
		add_filter('kb_additional_block_data_proxy', array($this, 'add_data'),10, 2);
		add_filter('kb_modify_block_proxy', array($this, 'modify_data'),10,1);
		add_filter('kb_modify_data_src_proxy', array($this, 'change_post_id'));
	}
	
	public function options() {
		
		$defaults = array(
			'post_type' => null,
			'ID'		=> null,
			'area_id'	=> null,
			'block_id'	=> null
		);
		
		$data = wp_parse_args($data, $defaults);
		
		extract($data, EXTR_SKIP);
		
		$this->post_type	= $post_type;
		$this->ID			= $ID;
		$this->area_id		= $area_id;
		$this->block_id		= $block_id;
		
		
		$out = '';
		
		$out .= "<div class='proxy-step-wrapper'>";
		$out .= "<h4 class='proxy-toggle'>Selector</h4>";
		$out .= "<div class='holder hide'>";
		
		$out .= "<div class='proxy-section step-1'>";
		$out .= "<label>Chose Post Type</label>";	
		$out .= $this->get_post_select($post_type);
		$out .= "<div class='proxy-loader'></div>";
		$out .= "</div>";
		
		
		$out .= "<div class='proxy-section step-2'>";
		$out .= "<label>Chose Item</label>";	
		$out .= $this->get_item_select($ID);
		$out .= "</div>";
		
		
		$out .= "<div class='proxy-section step-3'>";
		$out .= "<label>Chose Area</label>";	
		$out .= $this->get_area_select();
		$out .= "</div>";
		
		$out .= "<div class='proxy-section step-4'>";
		$out .= "<label>Chose Block</label>";	
		$out .= $this->get_block_select();
		$out .= "<input id='{$this->instance_id}_select_block' class='proxy-select-block' type='button' class='button-primary' disabled='disabled' value='select' />";
		$out .= "</div>";	
		
		$out .= "</div>"; // end holder
		$out .= "</div>"; // end wrapper
		
		$out .= "<div id='{$this->instance_id}_proxy_result'>{$this->the_result()}</div>";
		$out .= "<input type='hidden' name='{$this->instance_id}[block_chosen]' id='{$this->instance_id}_block_chosen' value='{$data['block_chosen']}' />";
		
		echo $out;
	}
	
	
	public function module($data) {
		return false;
	}
	
	
	
	public function save($data) {
		
		return $data;	
	}
	
	
	
	function add_data($block, $data)
	{
		
		$block['is_proxy'] = 'true';
		$block['proxy_data']['link'] = $data['block_id'];
		$block['proxy_data']['post_id'] = $data['ID'];
		return $block;
	}
	
	
	function modify_data($block)
	{
		
		$defaults = array(
			'link' => false,
			'post_id' => false
		);
		
		$data = wp_parse_args($block['proxy_data'], $defaults);
		
		$kb = get_post_meta($data['post_id'], 'kb_kontentblocks', true);
		
		
		
		$kb[$data['link']]['is_proxy'] = true;
		$kb[$data['link']]['overload'] = $data;
		$kb[$data['link']]['area']	= $block['area'];
		$kb[$data['link']]['status']	= $block['status'];
		
		
		return $kb[$data['link']];
		
		
	}

	
	
	function change_post_id($instance, $post_id)
	{
		$new_id = $instance->overload['post_id'];
		var_dump($instance);
		return $new_id;
	}







	/* --------------------------------------
	 * Select Fields for each type
	 * --------------------------------------
	 */
	
	
	/*
	 * Select Box for public post types
	 */
	function get_post_select()
	{
		$post_types = get_post_types(array('public' => true), 'objects', 'and');
		
		$out = "<select class='proxy-select' rel='post_list' name='{$this->instance_id}[post_type]'>";
		$out.= "<option value=''>Chose one</option>";
			foreach ($post_types as $post_type)
			{
				$selected = selected($this->post_type, $post_type->name, 0);
				$out .= "<option {$selected} value='{$post_type->name}'>{$post_type->name} </option>";
			}	
		$out .= "</select>";
		
		return $out;
	}
	
	/*
	 * Select Box for whatever posts in post type
	 */
	function get_item_select()
	{

		$out = "<select id='{$this->instance_id}_post_list' class='proxy-select' rel='area_list' name='{$this->instance_id}[ID]'>";
		$out.= "<option value=''>Chose one</option>";
		$out.= $this->get_post_list();
		$out .= "</select>";
		
		return $out;
	}
	/*
	 * Select Box for areas available for this post id
	 */
	function get_area_select()
	{
		
		$out = "<select id='{$this->instance_id}_area_list' class='proxy-select' rel='block_list' name='{$this->instance_id}[area_id]'>";
		$out.= "<option value=''>Chose one</option>";
		$out.= $this->get_area_list();
		$out .= "</select>";
		
		return $out;
	}
	
	/*
	 * Select Box for available blocks in this area
	 */
	function get_block_select()
	{
		
		$out = "<select id='{$this->instance_id}_block_list' rel='block' class='proxy-select block-select'  name='{$this->instance_id}[block_id]'>";
		$out.= "<option value=''>Chose one</option>";
		$out.= $this->get_block_list();
		$out .= "</select>";
		
		return $out;
	}
	
	
	/*
	 * Ajax result
	 */
	function get_result()
	{
		$data = ( isset($_POST['payload'])) ? $_POST['payload'] : false;
		
		if ($data)
			extract ( $_POST['payload'], EXTR_SKIP);
		
		
		$blocks = get_post_meta($area_list, 'kb_kontentblocks', true);
		$block = $blocks[$block];
		
		$origin = get_edit_post_link($area_list);
		
		$out = '';
		$out .= "<h2> Reference to: {$block['name']}</h2>";
		$out .= "<p><a href='{$origin}'>origin</a></p>";
		
		$result = array(
			'html' => $out,
			'status' => 'success'
		);
		
		wp_send_json($result);
		
		
	}
	
	
	function the_result()
	{
		$blocks = get_post_meta($this->ID, 'kb_kontentblocks', true);
		$block = $blocks[$this->block_id];
		
		$origin = get_edit_post_link($this->ID);
		
		$out = '';
		$out .= "<h2> Reference to: {$block['name']}</h2>";
		$out .= "<p><a href='{$origin}'>origin</a></p>";
		
		return $out;
	}
	
	
	/* -------------------------------------
	 * Content getter
	 * ------------------------------------- 
	 */
	
	/*
	 * Get list of posts in specified post type
	 * 
	 * @var value post type name
	 */
	function get_post_list()
	{
		$out = '';
		// value = post type name
		
		if (isset($_POST['kbajax']) && isset($_POST['type']))
		{
			$post_type = $_POST['value'];
		}
		else
		{
			$post_type = $this->post_type;
		}
		if (!$post_type)
			return;
		
		$post_list = get_posts(array('post_type' => $post_type, 'numberposts' => -1));
		
		foreach ($post_list as $post)
		{
			$selected = selected($this->ID, $post->ID, 0);
			$out .= "<option {$selected} value='{$post->ID}'>{$post->post_title} </option>";
		}
		
		if (isset($_POST['kbajax']))
			wp_send_json ( $out );
		else
			return $out;
	}
	
	
	
	/*
	 * Get list of available areas for post id
	 * @var value ID of specified post
	 */
	function get_area_list()
	{
		$out = '';
		// value = ID
		
		if (isset($_POST['kbajax']) && isset($_POST['type']))
		{
			$ID = $_POST['value'];
		}
		else
		{
			$ID = $this->ID;
		}
		if (!$ID)
			return;
		
		$area_list = $this->_find_areas($ID);
		
		foreach ($area_list as $area)
		{
			$selected = selected($this->area_id, $area['id'], 0);
			$out .= "<option {$selected} value='{$area['id']}'>{$area['name']} </option>";
		}
		
		if (isset($_POST['kbajax']))
			wp_send_json ( $out );
		else
			return $out;
	}
	
	
	
	
	/*
	 * Select Box for found blocks in specified area
	 */
	function get_block_list()
	{
		
		$out = '';
		if (isset($_POST['kbajax']) && isset($_POST['type']))
		{
			$area_id = $_POST['value'];
			
			// collection of already gathered informations
			$pay = $_POST['payload'];
		}
		else
		{
			$area_id = $this->area_id;
		}
		if (!$area_id and empty($pay))
			return;
		
		
		$post_id = (!empty($pay['area_list'])) ? $pay['area_list'] : $this->ID;
		$blocks = get_post_meta($post_id, 'kb_kontentblocks', true);
		$collect = array();
		

		
		foreach ($blocks as $block)
		{
			if ($block['area'] == $area_id)
			{
				$collect[] = $block;
			}
		}
		
		foreach ($collect as $block)
		{
			$selected = selected($this->block_id, $block['instance_id'], 0);
			$out .= "<option {$selected} value='{$block['instance_id']}'>{$block['name']} </option>";
		}
		
		if (isset($_POST['kbajax']))
			wp_send_json ( $out );
		else
			return $out;
	}

	
	/* ---------------------------------
	 * Helper
	 * ---------------------------------
	 */
	
	/*
	 * Helper function to find available areas based on post type and page template
	 */
	public function _find_areas($id)
	{
		global $Kontentblocks;
		$page_template = null;
		
		$this->ID = $id;
		
		$post_type = get_post_type($id);
		
		if ( 'page' == $post_type)
			$page_template = get_post_meta($id,'_wp_page_template', true);
		
		//declare var
		$areas = array();
		
		// loop through areas and find all which are attached to this post type and/or page template
		foreach ( $Kontentblocks->areas as $area )
		{
	
			if (empty($area['context']))
				$area['context'] = 'side';	
			
			if ( ( ! empty($area['page_template']) ) && ( ! empty($area['post_type'])) )
			{
				if ( in_array( $page_template, $area['page_template'] ) && in_array( $post_type, $area['post_type'] ) )
				{
					$areas[] = $area;
				}
			}
			elseif ( !empty( $area['page_template'] ) )
			{
				if ( in_array( $page_template, $area['page_template'] ) )
				{
					
					$areas[] = $area;
				}
			}
			elseif ( !empty( $area['post_type'] ) )
			{
				if ( in_array( $post_type, $area['post_type'] ) )
				{
					$areas[] = $area;
				}
			}
			
		};
		
		return $areas;
		
	}
	
	
	

	
	
	/*
	 * Enqueue Proxy Block Script and Styles on admin area
	 */
	
	function enqueue_files()
	{
		wp_enqueue_style('proxy', KB_TEMPLATE_URL . 'kb_proxy/KBProxy.css');
	}
	
}