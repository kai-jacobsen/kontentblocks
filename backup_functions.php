<?php

	/**
	 * Make sure there are no stored settings for non-existing blocks
	 * 
	 * This makes sure that there are no settings left in the options table for non existing blocks
	 * This has no impact when in dev_mode
	 */
	public function _equalize_block_data()
	{
		if ($this->dev_mode) return;
		
		// flag
		$needs_update = false;
		$loaded_blocks = __return_empty_array();
		$blocks_settings = get_option('kb_block_options');
		
		// loaded blocks id array
		if (! empty($this->blocks))
		{
			foreach ($this->blocks as $block)
			{
				$loaded_blocks[] = $block->id;
			}			
		}
		
		if (!is_array($loaded_blocks))
			return;
		
		//equalize
		if (!$blocks_settings)
			return;
		
		foreach($blocks_settings as $id => $settings)
		{
			if ( ! in_array($id, $loaded_blocks))
			{
				$needs_update = true;
				unset($blocks_settings[$id]);
			}
		}
		
		if (true === $needs_update)
			update_option('kb_block_options', $blocks_settings);
	}
	
	
		/**
	 * Get content types - post types and page templates where KB is setup
	 *
	 * simply gets the array of content types fom the option table.
	 * Setup happens on plugin option page 'Kontentblocks'
	 */
	public function _register_kontentblocks()
	{
		$types = get_option( 'kontentblocks' );
		
		$man = apply_filters('register_kontentblocks', $types);
		
		$alltypes = wp_parse_args($types, $man);
		
		$this->content_types = $alltypes;
	}
	
	
	/**
	 * Get registered areas with its settings as registered by the "Areas"-Plugin Page and store inside class property
	 *
	 */
	public function _get_areas()
	{

		if ($this->dev_mode == true)
			return;
		
		$areas = get_option( 'kb_registered_areas' );

		if ( is_array( $areas ) )
		{
			foreach ( $areas as $area )
			{
				$this->areas[$area['id']] = $area;
			}
		}
	}
	
	
		
	/**
	 * Registers the 'add last-item to nth child'-setting to each area
	 * TODO: rethink and maybe drop this, should be handled on demand by public api
	 * 
	 * @param array $area 
	 */
	public function _default_area_settings($area)
	{
		$this->register_area_settings( 
			array(
				'id'		=> 'lastitem',
				'area_id'	=> $area['id'],
				'type'		=> 'last-item',
				'value'		=> '',
				'label'		=> 'add .last-item every',
				) 
			);

		$this->register_area_settings( 
			array(
				'id'		=> 'addclasses',
				'area_id'	=> $area['id'],
				'type'		=> 'classes',
				'value'		=> '',
				'label'		=> 'additional classes',
				) 
			);
	}

	
	/**
	 * Generate Block markup for whatever is inside 'options' method of a BLock
	 * 
	 * @global object post
	 * @param array block
	 * @param $context | area context
	 * @param open | css class kb_open added / not added
	 * @param args array (post_type, 'page_template')
	 */
	public function generate_options($block, $context = null, $open = false, $post_type = null, $page_template = 'default')
	{
		global $post;
		/* $post is not available during an ajax call
		 * but we're using the same function for blocks already added, and new added block via AJAX
		 * maybe just check for XHR request
		 * 
		 */
		
		if( !class_exists($block['class']))
			return;
		
		// set post_id
		if ( !isset( $post->ID ) )
		{
			if (true == $this->post_context)
			{
				$post_id = $_REQUEST['post_id'];
			}
			else
			{
				$post_id = null;
			}
			
		}
		else
		{
			$post_id = $post->ID;
		}

		// extract the block id number
		$count = strrchr( $block['instance_id'], "_" );
		// get instance
		if (!empty ($this->blocks[$block['class']]) )
		{
			$instance = $this->blocks[$block['class']];
		}
		else
		{
			return;
		}
		
		// set property instance_id (unique id)
		$instance->instance_id = $block['instance_id'];
		// set context
		$instance->area_context = $context;
		$instance->layout = (!empty($block['field-layout'])) ? $block['field-layout'] : false;
		$instance->post_type = $post_type;
		$instance->page_template = $page_template;
		// classname
		$classname = get_class($instance);

		$disabled = ( $instance->settings['disable'] == 'disable' ) ? true : false;
		$disabledclass = ($disabled) ? 'disabled' : null;
		$uidisabled = ($disabled) ? 'ui-state-disabled' : null;
		
		$locked = ( $block['locked'] == 'false' || empty($block['locked']) ) ? 'unlocked' : 'locked';
		$predefined = (isset($block['predefined']) and $block['predefined'] == '1') ? $block['predefined'] : null;
		$unsortable = ((isset($block['unsortable']) and $block['unsortable']) == '1') ? 'cantsort' : null;
		$lockedmsg = (!current_user_can('lock_kontentblocks')) ? 'Content is locked' : null;
		
		$openclass = (true == $open) ? 'kb-open' : null;
		
			// Block List Item
			echo "<li id='{$instance->instance_id}' rel='{$instance->instance_id}{$count}' data-blockclass='{$classname}' class='{$instance->id} kb_wrapper kb_block {$block['status']} {$disabledclass} {$uidisabled} {$locked} {$openclass} {$unsortable}'>
			<input type='hidden' name='{$instance->instance_id}[area_context]' value='$instance->area_context' /> 
			";

			//markup for block header
			echo $this->_block_header($block['instance_id'], $block['name'], $instance->name, $block['status'], $disabled, $disabledclass, $locked, $predefined);
			
			// markup for each block
			echo "	<div class='kb_inner'>";
			
					if ($lockedmsg && KONTENTLOCK)
					{
						echo $lockedmsg;
					}
					else 
					{
						
					
					$description = (!empty( $instance->settings['description'] )) ? __( '<strong><em>Beschreibung:</em> </strong>' ) . $instance->settings['description'] : '';
					$l18n_block_title = __( 'Modul Bezeichnung', 'kontentblocks' );
					$l18n_draft_status = ( $block['draft'] == 'true' ) ? '<p class="kb_draft">'.__('This Kontentblock is a draft and won\'t be public until you publish or update the post', 'kontentblocks').'</p>' : '';
			echo "		<div class='kb_block_title'>
							<label for='block_title'>{$l18n_block_title}</label>
							<input type='text' name='{$instance->instance_id}[block_title]' value='{$block['name']}' />
							<p class='description'>{$description}</p>
							<div class='block-notice hide'>
								<p>Es wurden Veränderungen vorgenommen. <input type='submit' class='button-primary' value='Aktualisieren' /></p>
							</div>
							{$l18n_draft_status}
						</div>";
					
					if ( true == $this->post_context)
					{
						$data = get_post_meta( $post_id, '_' . $block['instance_id'], true );	
					}
					else
					{
						$data = get_option($block['instance_id'], array());
					}
					
					$instance->post_id = $post_id;
					
					// if disabled don't output, just show disabled message
					if ($disabled)
					{
						echo "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
					}
					else
					{
						// output the form fields for this block
						$instance->options( $data );
						$instance->_block_options($block);
					}
					}

			echo "	</div>
					</li>";
			
		}
		
		/**
		 * Create Markup for Block Header
		 * @param string $instance_id - unique ID of this block
		 * @param string $public_name - Block name/title
		 * @param string $original_name - original name/title
		 * @param string $status - 'kb_inactive' or empty
		 * @param bool $disabled 
		 * @param string $disabledclass
		 */
		private static function _block_header($instance_id, $public_name, $original_name, $status, $disabled, $disabledclass, $locked = 'unlocked', $predefined = false)
		{
			$html = '';
			
			//open header
			$html .="<div rel='{$instance_id}' class='block-head clearfix edit kb-title'>";
			
			// toggle button
				$html .="<div class='kb-toggle'></div>";
			
			
			// locked icon
			if (!$disabled && KONTENTLOCK)		
			{
				$html .="<div class='kb-lock {$locked}'></div>";
			}
			
			// disabled icon
			if ($disabled)
			{
				$html .="<div class='kb-disabled-icon'></div>";
			}
			
			// name
			$html .="<div class='kb-name'>{$public_name}</div>";
			
			// original name
			$html .="<div class='kb-sub-name'>{$original_name}</div>";
			// delete button
			if (!$predefined == true)
			{
				if (!$disabled )
				{
				
					if ( current_user_can('delete_kontentblocks') )
					$html .="<div class='kb-delete kb_delete_block {$disabledclass}'></div>";
					
				}
			}
			// status button
			if (!$disabled)
			{
				if ( current_user_can('deactivate_kontentblocks') )
					$html .="<div class='kb-power kb_set_status {$status} {$disabledclass}'></div>";
			}
			
			
			// ajax spinner
			$html .="<div class='kb-ajax-status'></div>";
			
			// area meta // deprecated
			$html .="<div class='area-meta'></div>";
			
			//close header
			$html .="</div>";
			
			return $html;
		}