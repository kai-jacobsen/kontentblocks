<?php
global $Kontentblocks, $current_screen;

if ( isset($_GET['area']))
{
	$area_id = $_GET['area'];
}
else
{
	die('Something wrong here Baby!');
}

// get areas data
$areas = $Kontentblocks->get_areas();

if (!isset( $areas[$area_id] ) )
	wp_die('Area does not exist.');

$area = $areas[$area_id];


	// defaults
$defaults = array(
		'id'				=> '',
		'name'				=> '',
		'description'		=> '',
		'block_limit'		=> 0,
		'before_area'		=> '<div id="%s" class="kb_area %s">',
		'after_area'		=> '</div>',
		'page_template'		=> __return_empty_array(),
		'post_type'			=> __return_empty_array(),
		'available_blocks'	=> __return_empty_array(),
		'area_templates'	=> __return_empty_array(),
		'dynamic'			=> true,
		'default_tpl'		=> '',
		'order'				=> 0,
		'context'			=> 'normal',
		'belongs_to'		=> ''
	);
$area = wp_parse_args($area, $defaults);

// Area Edit Form
// ----------------------------------------


// prepare data
$before_area = stripslashes($area['before_area']);
$after_area = stripslashes($area['after_area']);

$dynamic = (true == $area['dynamic']) ? true : false;

$html = "

	<form action='admin.php?page={$current_screen->parent_base}&action=update-settings&area={$area['id']}' method='post' />
		". wp_nonce_field('kb_edit_area','kb_edit_area_nonce') ."
		<input type='hidden' name='new_area[dynamic]' value='{$dynamic}' >
		<div class='kb_area_edit_form kb_page_wrap' >

			<div class='kb_area_edit_section column'>
				<h2 class='section_title'>Settings</h2>
			</div>

			<div class='kb_area_edit_section column'>
				<h4 class='section_title'>Section Title</h4>

				<div class='area_edit_tabs kb_fieldtabs'>	

					<ul>
						<li><a href='#name'>Name</a></li>
						<li><a href='#description'>Description</a></li>
						<li><a style='display:none' href='#limit'>Block Limit</a></li>
						<li><a href='#markup'>Area Before & After</a></li>
					</ul>

					<div id='name'>
						<div class='kb_field'>
							<label class='kb_label heading' for='area_name'>Area Name</label>
							<input type='text' id='area_name' class='regular-text' name='new_area[name]' value='{$area['name']}' >
							<p class='description'>Name of this area as it apperas in the area header</p>
	
						</div>
						<div class='kb_field' style='display:none'>
							<label class='kb_label heading' for='area_context'>Area Context</label>
							<input type='text' id='area_context' class='regular-text' name='new_area[context]' value='{$area['context']}' >
						</div>
						<div class='kb_field' style='display:none'>>
							<label class='kb_label heading' for='area_order'>Area Order Index</label>
							<input type='text' id='area_order' class='regular-text' name='new_area[order]' value='{$area['order']}' >
						</div>
						<div class='kb_field' style='display:none'>>
							<label class='kb_label heading' for='area_order'>Belongs to:</label>
							<input type='text' id='belongs_to' readonly='readonly' class='regular-text' name='new_area[belongs_to]' value='{$area['belongs_to']}' >
						</div>
					</div>

					<div id='description'>
						<div class='kb_field'>
							<label class='kb_label heading' for='area_description'>Description</label>
							<input type='text' id='area_description' class='regular-text' name='new_area[description]' value='{$area['description']}' >
							<p class='description'><strong>Short</strong> description for this area as it appears in the Area header.</p>

						</div>
					</div>

					<div id='limit'>
						<div class='kb_field'>

							<label class='kb_label heading' for='area_limit'>Limit no. of Blocks to:</label>
							<input type='text' id='area_limit' class='small' name='new_area[block_limit]' value='{$area['block_limit']}' >
							<p class='description'><strong>Info:</strong>The number of allowed Blocks in this Area can be limited. Use 0 for unlimited.</p>

						</div>
					</div>

					<div id='markup'>
						<div class='kb_field'>
							<label class='kb_label heading' for='area_before'>HTML before area:</label>
							<input type='text' id='area_before' class='regular-text' name='new_area[before_area]' value='{$before_area}' >	
						<p class='description'>HTML to be wrapped around the Area. Make sure to keep the placeholder (%s), it's used for dynamic, additional classes.</p>
						</div>

						<div class='kb_field'>
							<label class='kb_label heading' for='area_after'>HTML after area:</label>
							<input type='text' id='area_after' class='regular-text' name='new_area[after_area]' value='{$after_area}' >	
						</div>
					</div>
				</div>
			</div>";




$html.="	<div class='kb_area_edit_section column'>
				<h4 class='section_title'>Availability</h4>

				<div class='area_edit_tabs kb_fieldtabs'>

					<ul>";
				

$html.="					<li><a href='#post-types'>Post Types</a></li>
							<li><a style='display:none' href='#page-templates'>Page Templates</a></li>";

$html.="				<li><a href='#available-blocks'>Available Blocks</a></li>
						<li><a style='display:none' href='#area_templates'>Area Templates</a></li>
					</ul>";

$html.="			<div id='post-types' class='area_third'>
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
						$page_templates = apply_filters('fwk_add_page_template', $page_templates);

						foreach ($page_templates as $template => $filename)
						{
							$checked = (in_array($filename, $area['page_template'])) ? 'checked="checked"' : '';
$html.="					<tr>
							<td class='cb'><input type='checkbox' name='new_area[page_template][]' id='{$filename}' value='{$filename}' {$checked} ></td>
							<td><label for='{$filename}'>{$template}</label></td>
							<td class='description'>{$filename}</td>
							</tr>";							
						}
$html.="				</table>
					</div>";


$html.="			<div id='available-blocks' class='area_third'>
						<table class='available_blocks'>";

						if ( !empty($Kontentblocks->blocks))
						{
							foreach ($Kontentblocks->blocks as $block)
							{
								if (isset($block->settings['in_dynamic']) && $block->settings['in_dynamic'] != true)
									continue;

								$blockclass = get_class($block);
								if ($area['available_blocks'] == 'any')
								{
									$checked = 'checked="checked"';
								}
								else
								{
								$checked = (in_array($blockclass, $area['available_blocks'])) ? 'checked="checked"' : '';
								}
$html.="						<tr>									
								<td class='cb'><input type='checkbox' name='new_area[available_blocks][]' id='{$block->id}' value='{$blockclass}' {$checked} ></td>
								<td><label for='{$block->id}'>{$block->settings['public_name']}</label></td>
								<td class='description'>{$block->settings['description']}</td>
								</tr>";							
							}
						}

$html.="				</table>
					</div>
					
					<div id='area_templates' class='area_third'>
						<table class='area_templates'>";
					
						if ( !empty($Kontentblocks->area_templates))
						{
							foreach ($Kontentblocks->area_templates as $tpl)
							{
								$defaults = array(
										'id'			=> '',
										'label'			=> '',
										'description'	=> ''
									);
							$tpl = wp_parse_args($tpl, $defaults);
							
							$checked = (in_array($tpl['id'], $area['area_templates'])) ? 'checked="checked"' : '';
							$selected = checked($area['default_tpl'], $tpl['id'], false);
$html.="					<tr>									
								<td class='radio'><input type='radio' name='new_area[default_tpl]' value='{$tpl['id']}' {$selected} ></td>
								<td class='cb'><input type='checkbox' name='new_area[area_templates][]' id='{$tpl['id']}' value='{$tpl['id']}' {$checked} ></td>
								<td><label for='{$tpl['id']}'>{$tpl['label']}</label></td>
								<td class='description'>{$tpl['description']}</td>
							</tr>";			
							}
						}
$html.="				</table>
					</div>		
				</div>
			</div>";
$html .= "</div>
		<input type='submit' class='button-primary' value='update area' > 
		</form>";
echo $html;