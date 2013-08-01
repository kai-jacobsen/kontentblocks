<?php
    global $Kontentblocks, $current_screen;

	$user_id = get_current_user_id();
	// Area Add Form
	// ----------------------------------------

	// defaults
		$new_area = array(
		'id'				=> '',
		'name'				=> '',
		'description'		=> '',
		'block_limit'		=> 0,
		'before_area'		=> '<div id="%s" class="kb_area %s">',
		'after_area'		=> '</div>',
		'page_template'		=> __return_empty_array(),
		'post_type'			=> array('page'),
		'available_blocks'	=> __return_empty_array(),
		'area_templates'	=> __return_empty_array(),
		'dynamic'			=> true,
		'default_tpl'		=> '',
		'order'				=> 10,
		'context'			=> 'normal',
		'belongs_to'		=> ''
	);


		
    if (isset($_GET['error']))
    {
        $data = get_transient($user_id . '_error_areas_create');      
       
        if (!empty($data))
            $area = wp_parse_args ( $data, $new_area );
        else
            $area = $new_area;
        
      
        
        $error = new \WP_Error();
        if( empty($data['id'])) $error->add('area_create', 'ID must be set');
        if( empty($data['name'])) $error->add('area_create', 'Name must be set');
        
        delete_transient($user_id . '_error_areas_create');
        
    }    
		
	if ( ! empty($_POST['new_area']) && !isset($_GET['error']) )
	{
		$area = wp_parse_args($_POST['new_area'], $new_area);
	}
	elseif (!isset($_GET['error']))
	{
		$area = $new_area;
	}
    
	$html = "
	
		<form action='admin.php?page={$current_screen->parent_base}&action=add' method='post' id='add-area-form' />
			".wp_nonce_field('kb_add_area','kb_add_area_nonce')."
			<div class='kb_area_edit_form kb_page_wrap'>";
		
		if ( isset($error) && is_wp_error($error))
		{
			$errors = $error->get_error_messages('area_create');
			foreach($errors as $msg)
			{
				$html .= "<div class='error'><p>{$msg}</p></div>";
			}
		}
		
	$html.="	<div class='kb_area_edit_section column'>
					<h2 class='section_title'>Einstellungen</h2>
				</div>
						
				<div class='kb_area_edit_section column'>
					<h4 class='section_title'>Titel</h4>
					
					<div class='area_edit_tabs kb_fieldtabs'>	
						
						<ul>
							<li><a href='#id'>Required</a></li>
							<li><a href='#description'>Beschreibung</a></li>
							<li style='display:none'><a href='#limit'>Modullimit</a></li>
							<li><a href='#markup'>Area Before & After</a></li>
						</ul>
						
						<div id='id'>
							<div class='kb_field'>
								<label class='kb_label heading' for='area_id'>ID</label>
								<input type='text' id='area_id' class='regular-text form-required' name='new_area[id]' value='{$area['id']}' placeholder='required ID' >
								<p class='description'>ID muss einzigartig sein und kann nicht mehr geändert werden.</p>

							</div>
								
							<div class='kb_field'>
								<label class='kb_label heading' for='area_name'>Name</label>
								<input type='text' id='area_name' class='regular-text form-required' name='new_area[name]' value='{$area['name']}' placeholder='required Name' >
								<p class='description'>Name / Bezeichner des neuen Bereichs</p>

							</div>
						</div>
								
						<div id='description'>
							
							<div class='kb_field'>
								<label class='kb_label heading' for='area_description'>Description</label>
								<input type='text' id='area_description' class='regular-text' name='new_area[description]' value='{$area['description']}' placeholder='Short description for area header' >
								<p class='description'><strong>Kurze</strong> Beschreibung des Bereichs (optional)</p>
							</div>
						</div>
						
						<div id='limit'>
							<div class='kb_field'>
								
								<label class='kb_label' for='area_limit'>Begrenzt die Anzahl möglicher Module in diesem Bereich:</label>
								<input type='text' id='area_limit' class='small' name='new_area[block_limit]' value='{$area['block_limit']}' >
								<p class='description'><strong>Info:</strong>The number of allowed Blocks in this Area can be limited. Use 0 for unlimited.</p>

							</div>
						</div>
						
						<div id='markup'>
							<div class='kb_field'>
								<label class='kb_label heading' for='area_before'>HTML before area:</label>
								<input type='text' id='area_before' class='regular-text' name='new_area[before_area]' value='{$area['before_area']}' >	
								<p class='description'>HTML to be wrapped around the Area. Make sure to keep the placeholder (%s), it's used for dynamic, additional classes.</p>
	
							</div>

							<div class='kb_field'>
								<label class='kb_label heading' for='area_after'>HTML after area:</label>
								<input type='text' id='area_after' class='regular-text' name='new_area[after_area]' value='{$area['after_area']}' >	
							</div>
						</div>
					</div>
				</div>";
						
						
				
				
	$html.="	<div class='kb_area_edit_section column'>
					<h4 class='section_title'>Zuordnung</h4>
					
					<div class='area_edit_tabs kb_fieldtabs'>
					
						<ul>
							<li><a href='#post-types'>Inhaltstypen</a></li>
							<li><a href='#page-templates'>Seitenvorlagen</a></li>
							<li><a href='#available-blocks'>Verfügbare Module</a></li>
							<li style='display:none'><a href='#area_templates'>Bereichlayouts</a></li>

						</ul>

						<div id='post-types' class='area_third kb_field'>
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
					
						<div id='page-templates' class='area_third kb_field'>
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

						<div id='available-blocks' class='area_third kb_field'>
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
									$defaults = array(
										'id'			=> '',
										'label'			=> '',
										'description'	=> ''
									);
								$tpl = wp_parse_args($tpl, $defaults);
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
			<a href='admin.php?page={$current_screen->parent_base}' class='button'>Cancel</a>
			</div>
			</form>";
	echo $html;
?>