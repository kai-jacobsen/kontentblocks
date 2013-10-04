<?php
namespace Kontentblocks\Extensions;

class KB_CopyMove
{

	static private $instance = null;

	static public function get_instance()
	{
		if ( null === self::$instance )
		{
			self::$instance = new self;
		}
		return self::$instance;
	}

	private function __construct()
	{
		
		add_filter('kb_block_header_menu', array( $this, 'add_menu_item'),11, 2);
		
		// Load modal contents
		add_action('wp_ajax_kb_copymove', array($this, 'modal_contents'));
		
		add_action('wp_ajax_copymove_get_post_list', array($this, 'get_post_list'));
		add_action('wp_ajax_copymove_get_area_list', array($this, 'get_area_list'));
		add_action('wp_ajax_copymove_get_block_list', array($this, 'get_block_list'));
	
		// Copy Action
		add_action('wp_ajax_kb_copymove_copy', array($this, 'copy') );
	}

	
	/* 
	 * Create the menu item
	 */
	public function add_menu_item( $html, $instance )
	{
		$html .= "<li class='kb-copymove'><a title='duplicate'></a></li>";	
		return $html;
	}
	
	
	/*
	 * Modal Contents
	 */
	public function modal_contents()
	{
		if (!isset($_POST['data']))
			wp_send_json_error ( );
		
		$data = $_POST['data'];
		
		$this->instance_id		= $data['instance_id'];
		$this->class			= $data['class'];
		
		
		$defaults = array(
			'post_type' => null,
			'ID'		=> null,
			'area_id'	=> null,
			'block_id'	=> null
		);
		
		$data = wp_parse_args($data, $defaults);
		
		
		$out = '';
		
		$out .= "<div class='copymove-wrapper'>";
		$out .= "<a class='copymove-back' href='#'>back</a>";
		$out .= "<div class='holder'>";
		
		$out .= "<div class='copymove-section step-1'>";
		$out .= "<div class='context-header'>";
		$out .= "<h2>Post Type</h2><p class='description'>Some description for the reader</p>";
		$out .= "</div>";
		$out .= "<div class='inner'>";
		$out .= $this->get_post_select();
		$out .= "<div class='copymove-loader'></div>";
		$out .= "</div></div>";
		
		
		$out .= "<div class='copymove-section step-2'>";
		$out .= "<div class='context-header'>";
		$out .= "<h2>Post Type</h2><p class='description'>Some description for the reader</p>";
		$out .= "</div>";
		$out .= "<div class='inner'>";	
		$out .= $this->get_item_select();
		$out .= "</div></div>";
		
		
		$out .= "<div class='copymove-section step-3'>";
		$out .= "<div class='context-header'>";
		$out .= "<h2>Post Type</h2><p class='description'>Some description for the reader</p>";
		$out .= "</div>";
		$out .= "<div class='inner'>";	
		$out .= $this->get_area_select();
		$out .= "</div></div>";


		$out .= "<div class='copymove-section step-4'>";
		$out .= "<div class='context-header'>";
		$out .= "<h2>Go</h2><p class='description'>Some description for the reader</p>";
		$out .= "</div>";
		$out .= "<div class='inner'>";	
		$out .= "<a class='button primary kb-copymove-send' href='#'>GO!</a>";
		$out .= "</div></div>";		
		
		$out .= "</div>"; // end holder
		$out .= "</div>"; // end wrapper
				
		wp_send_json($out);
		
	}
	
	
	/*
	 * Copy Action
	 */
	public function copy()
	{
		
		if (!isset($_POST))
			wp_send_json_error ( );
		
		// original data first
		$post_id = $_POST['post_id'];
		$instance_id = $_POST['data']['instance_id'];
		
		$kblocks = get_post_meta($post_id, 'kb_kontentblocks', true);
		$copy = $kblocks[$instance_id];
		
		if (empty($copy))
			wp_send_json_error ( );
		
		$data = get_post_meta($post_id, '_' . $instance_id, true);
		
		
		// target
		$target_id = $_POST['data']['payload']['area_list'];
		$target_area = $_POST['data']['payload']['area'];
		
		// update area
		$copy['area'] = $target_area;
		
		$t_kblocks = get_post_meta($target_id, 'kb_kontentblocks', true);
		$t_kblocks[$instance_id] = $copy;
		update_post_meta($target_id, 'kb_kontentblocks', $t_kblocks);
		
		update_post_meta($target_id, $instance_id, $data);
		
		$link = get_edit_post_link($target_id);
		
		wp_send_json_success($link);
		
		
		
	}


	/*
	 * Select Box for public post types
	 */
	function get_post_select()
	{
		$post_types = get_post_types(array('public' => true), 'objects', 'and');
		
		$out = "<div rel='post_list'>";
		$out.= "<select class='copymove-select chzn' rel='post_list' name='{$this->instance_id}[post_type]'>";
		$out.= "<option value=''>Chose one</option>";
			foreach ($post_types as $post_type)
			{
				
				$out .= "<option value='{$post_type->name}'>{$post_type->name} </option>";
			}	
		$out .= "</select>";
		$out .= "</div>";
		return $out;
	}

	
	
	
	/*
	 * Select Box for whatever posts in post type
	 */
	function get_item_select()
	{

		$out = "<div id='copymove_post_list' class='select-container' rel='area_list'>";
		$out .= "</div>";
		
		return $out;
	}
	
	
	
	
	
	/*
	 * Select Box for areas available for this post id
	 */
	function get_area_select()
	{
		
		$out = "<div rel='area'>";
		$out.= "<select id='copymove_area_list' class=''  name='{$this->instance_id}[area_id]'>";
		$out.= "<option value=''>Chose one</option>";
		$out.= $this->get_area_list();
		$out .= "</select>";
		$out.= "</div>";
		
		return $out;
	}
	
	
	
	
	
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
		
		if ($post_type !== 'page')
		{
			$post_list = get_posts(array('post_type' => $post_type, 'numberposts' => -1));

			$out .= "<select class='copymove-select' rel='area_list' name='kb_copymove[ID]'>";
			$out .= "<option value=''>Chose one</option>";

			foreach ($post_list as $post)
			{	
				$out .= "<option value='{$post->ID}'>{$post->post_title} </option>";
			}

		$out .= "</select>";			
		}
		elseif ($post_type === 'page')
		{
			
		$out .= wp_dropdown_pages(array('echo' => false, 'name' => 'copymove[ID]', 'post_type' => $post_type));
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
			$this->ID = $_POST['value'];
			
		}
		
		if (!isset($this->ID))
			return;
		
		$area_list = $this->_find_areas($this->ID);
		
		foreach ($area_list as $area)
		{
			
			$out .= "<option value='{$area['id']}'>{$area['name']} </option>";
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


}


KB_CopyMove::get_instance();