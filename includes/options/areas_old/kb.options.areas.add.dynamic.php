<?php
    global $Kontentblocks;
	
	if (isset($_GET['create']) && $_GET['create'] == 'true' )
	{
		$error = '';
		check_admin_referer('kb_add_area','kb_add_area_nonce');

		$data = (isset($_POST['new_area'])) ? $_POST['new_area'] : array();

		if( empty($data['id']) OR empty($data['name']))
		{
			$error = new WP_Error();
			if( empty($data['id'])) $error->add('area_create', 'ID must be set');
			if( empty($data['name'])) $error->add('area_create', 'Name must be set');
		}

		if ( is_wp_error($error))
		{
			$errors = $error->get_error_messages('area_create');
			foreach($errors as $msg)
			{
				echo "<div class='error'><p>{$msg}</p></div>";
			}
		}

		elseif (! $error)
		{
			$location = 'admin.php?page=areas';
			// everything good, save area
			$areas = get_option('kb_registered_areas');
			$dynamic_areas = get_option('kb_dynamic_areas');

			// prepare id
			$sanitized_id = sanitize_title($data['id']);
			$data['id'] = $sanitized_id;
			
			// handle unset checkboxes, we don't want unset vars
			$data['page_template']		= ( ! empty($data['page_template'])) ? $data['page_template'] : array();
			$data['post_type']			= ( ! empty($data['post_type'])) ? $data['post_type'] : array();
			$data['available_blocks']	= ( ! empty($data['available_blocks'])) ? $data['available_blocks'] : array();
			$data['area_templates']		= ( ! empty($data['area_templates'])) ? $data['area_templates'] : array();
			// dynamic flag
			$data['dynamic']			= true;

			$areas[$data['id']] = $data;
			update_option('kb_registered_areas', $areas);
			
			$dynamic_areas[$data['id']] = array();
			update_option('kb_dynamic_areas', $dynamic_areas);

			$location = add_query_arg(array('message'=>'3', 'action' => false));
			wp_redirect($location);
		}
	}
	
	// Area Add Form
	// ----------------------------------------
	
	// i18l string
	$area_edit_i18l = __('Edit', 'kontentblocks');
	
	// defaults
	$new_area = normalize_area(array());
		
	if ( ! empty($_POST['new_area']))
	{
		$area = wp_parse_args($_POST['new_area'], $new_area);
	}
	else
	{
		$area = $new_area;
	}
	
	$html = "
	
		<form action='admin.php?page=kontentareas&action=add-form-dynamic&create=true' method='post' id='add-area-form' />
			".wp_nonce_field('kb_add_area','kb_add_area_nonce')."
			<div class='kb_area_edit_form kb_page_wrap'>
					
				<div class='kb_area_edit_section column'>
					<h2 class='section_title'>Settings</h2>
				</div>
						
				<div class='kb_area_edit_section column'>
					<h4 class='section_title'>Section Title</h4>
					
					<div class='area_edit_tabs'>	
						
						<ul>
							<li><a href='#id'>Required</a></li>
							<li><a href='#description'>Description</a></li>
							<li><a href='#limit'>Block Limit</a></li>
							<li><a href='#markup'>Area Before & After</a></li>
						</ul>
						
						<div id='id'>
							<p class='description'>Id of the new Area, must be unique and cannot be changed afterwards</p>
							<div class='kb_field'>
								<label for='area_id'>Area ID</label>
								<input type='text' id='area_id' class='regular-text form-required' name='new_area[id]' value='{$area['id']}' placeholder='required ID' >
							</div>
								
							<p class='description'>Name of this area as it apperas in the area header</p>
							<div class='kb_field'>
								<label for='area_name'>Area Name</label>
								<input type='text' id='area_name' class='regular-text form-required' name='new_area[name]' value='{$area['name']}' placeholder='required Name' >
							</div>
						</div>
								
						<div id='description'>
							<p class='description'><strong>Short</strong> description for this area as it appears in the Area header.</p>
							<div class='kb_field'>
								<label for='area_description'>Description</label>
								<input type='text' id='area_description' class='regular-text' name='new_area[description]' value='{$area['description']}' placeholder='Short description for area header' >
							</div>
						</div>
						
						<div id='limit'>
							<p class='description'><strong>Info:</strong>The number of allowed Blocks in this Area can be limited. Use 0 for unlimited.</p>
							<div class='kb_field'>
								
								<label for='area_limit'>Limit no. of Blocks to:</label>
								<input type='text' id='area_limit' class='small' name='new_area[block_limit]' value='{$area['block_limit']}' >
								
							</div>
						</div>
						
						<div id='markup'>
							<p class='description'>HTML to be wrapped around the Area. Make sure to keep the placeholder (%s), it's used for dynamic, additional classes.</p>
							<div class='kb_field'>
								<label for='area_before'>HTML before area:</label>
								<input type='text' id='area_before' class='regular-text' name='new_area[before_area]' value='{$area['before_area']}' >	
							</div>

							<div class='kb_field'>
								<label for='area_after'>HTML after area:</label>
								<input type='text' id='area_after' class='regular-text' name='new_area[after_area]' value='{$area['after_area']}' >	
							</div>
						</div>
					</div>
				</div>";
						
						
				
				
	$html.="	<div class='kb_area_edit_section column'>
					<h4 class='section_title'>Availability</h4>
					
					<div class='area_edit_tabs'>
					
						<ul>
							<li><a href='#post-types'>Post Types</a></li>
							<li><a href='#page-templates'>Page Templates</a></li>
							<li><a href='#available-blocks'>Available Blocks</a></li>
							<li><a href='#area_templates'>Area_templates</a></li>

						</ul>

						<div id='post-types' class='area_third'>
							<table class='area_post_types'>";
							
							$post_types = get_post_types( array( 'public' => true), 'objects', 'and' );
							foreach($post_types as $pt)
							{
								$checked = (in_array($pt->name, $area['post_type'])) ? 'checked="checked"' : '';
	$html.="					<tr class='kb_checkbox_option'>
									<td class='cb'><input type='checkbox' name='new_area[post_type][]' id='{$pt->name}' value='{$pt->name}' {$checked} ></td>
									<td><label for='{$pt->name}'>{$pt->labels->name}</label></td>
								</tr>";
							}
				
	$html.="				</table>
						</div>
					
						<div id='page-templates' class='area_third'>
							<table class='area_page_templates'>";
	
							$page_templates = get_page_templates();
							$page_templates['Default (page.php)'] = 'default';
						
							foreach ($page_templates as $template => $filename)
							{
								$checked = (in_array($filename, $area['page_template'])) ? 'checked="checked"' : '';
	$html.="					<tr>
								<td class='cb'><input type='checkbox' name='new_area[page_template][]' id='{$filename}' value='{$filename}' {$checked} ></td>	
								<td><label for='{$filename}'>{$template}</label></td>
								<td class='description'>{$filename}</td>
								</tr>
								";
								
							}
	$html.="				</table>
						</div>

						<div id='available-blocks' class='area_third'>
							<table class='available_blocks'>";
							
							if ( !empty($Kontentblocks->blocks))
							{
								foreach ($Kontentblocks->blocks as $block)
								{
									if ( !isset($block->settings['in_dynamic']) or $block->settings['in_dynamic'] == false)
										continue;
									
									$blockclass = get_class($block);
									$checked = 'checked="checked"';
	$html.="						<tr class='kb_area_block_item'>
									<td class='cb'><input type='checkbox' name='new_area[available_blocks][]' id='{$block->id}' value='{$blockclass}' {$checked}></td>
									<td><label for='{$block->id}'>{$block->settings['public_name']}</label></td>
									<td class='description'>{$block->settings['description']}</td>
									</tr>
									";								
								}
							}
						
	$html.="				</table>
						</div>

						<div id='area_templates' class='area_third'>
							<table class='area_templates'>";

							if ( !empty($Kontentblocks->area_templates))
							{
								$i = 0;
								foreach ($Kontentblocks->area_templates as $tpl)
								{
								$tpl = normalize_area_template($tpl);
								$checked = (in_array($tpl['id'], $area['area_templates'])) ? 'checked="checked"' : '';
								$selected = checked($i, 0, false);
								
	$html.="					<tr>
									<td class='radio'><input type='radio' name='new_area[default_tpl]' value='{$tpl['id']}' {$selected} ></td>
									<td class='cb'><input type='checkbox' name='new_area[area_templates][]' id='{$tpl['id']}' value='{$tpl['id']}' {$checked}></td>
									<td><label for='{$tpl['id']}'>{$tpl['label']}</label></td>
									<td class='description'>{$tpl['description']}</td>
								</tr>";			
								
								$i++;	
								}
							}
	$html.="				</table>
						</div>
					</div>
				</div>";
	$html .= "</div>
			<div class='kb_area_buttons'>
			<input id='add-area' type='submit' class='button-primary' value='create' >
			<a href='admin.php?page=kontentareas' class='button'>Cancel</a>
			</div>
			</form>";
	echo $html;
?>
