<?php

// make sure wordpress is loaded until calling wp_redirect
add_action('init', 'kb_block_templates_switch',900);
add_action('kb_update_block_template', 'kb_update_block_template_callback');
add_action('delete_block_template', 'kb_delete_block_template_callback');
// Page Switch
function kb_block_templates_switch()
{

	if (isset($_GET['page']) && $_GET['page'] == 'block_templates')
	{
		if ( (isset($_REQUEST['action']) && !empty($_REQUEST['action']) ) )
		{
			$action = ($_REQUEST['action'] == '-1') ? $_REQUEST['action2'] : $_REQUEST['action'];

			switch ($action)
			{

			case 'update':
				do_action('kb_update_block_template');
			break;
		
			case 'delete_template':
				do_action('delete_block_template');
			break;
		
			}
		}
	}
}

function kb_block_templates() {
	
	global $Kontentblocks;
	// intatiate table class
	$kb_block_templates_table = new KB_Block_Templates();
	
	$templateables = $Kontentblocks->get_templateables();
	
	// get action
	$action = ($kb_block_templates_table->current_action());
	
	switch ($action)
	{	
		case 'add-template':
			include plugin_dir_path( __FILE__ ) . 'kb.options.block_templates.add.php';
		break;

		case 'edit_template':
			include plugin_dir_path( __FILE__ ) . 'kb.options.block_templates.edit.php';
		break;
	
		
	
		case false:
			
			echo "	<form method='POST' action='admin.php?page=block_templates'>
				<input type='hidden' name='action' value='add-template' >
					<div class='kb_page_wrap'>
							<div class='kb_options_header'>
								<div id='icon-options-general' class='icon32'></div>
								<h2>Vorlagen für Inhaltsblöcke</h2>
							</div>";
								do_action('kb_admin_notices');
	
			echo "		<div class='kb_options_section create-new-block-template'>
						<label>Typ auswählen</label>
						<select name='class' class='chzn blocks'>
						<option value='null'>Bitte wählen</option>";
			
							foreach ($templateables as $classname => $block)
							{
								
			echo "				<option value=" . get_class($block) .">{$block->name}</option>";
							}
			
			echo "		</select>";
			
			echo "		<div class='template-name'>
							<label>Bezeichnung</label>
							<input type='text' name='template_name' value='' />
						</div>
						<input type='submit' class='primary button' value='Template erstellen' />
						</div></form>";
			// Area Table
			echo "<div class='kb_options_section block_templates_table'>";
			echo "<h2>Erstellte Vorlagen bearbeiten</h2>";
			$kb_block_templates_table->prepare_items();
			$kb_block_templates_table->display();
			echo "<div>";
			echo "</div>";
		break;
	};
}

function kb_update_block_template_callback()
{
	global $Kontentblocks, $Kontentbox;
	if (!isset($_REQUEST['id']))
		wp_die('No ID specified');
	
	$saved = get_option('kb_block_templates');
	$tpl = $saved[$_REQUEST['id']];
	
	if (empty($tpl))
		wp_die('Template does not exist');
	
	// get old data
	$old = get_option($tpl['instance_id']);
	
	// get ew data
	$data = stripslashes_deep( $_POST[$tpl['instance_id']] );
	
	// publish tpl
	$tpl['draft'] = $Kontentbox->_draft_check($tpl);
	
	// special block specific data
	$tpl = $Kontentbox->_individual_block_data($tpl, $data);
	
	$saved[$tpl['instance_id']] = $tpl;
	
	// handle saving
	$new = $Kontentblocks->blocks[$tpl['class']]->save( $old, $tpl['instance_id'], $data );
	
	// store new data in post meta
	if ( $new && $new != $old )
	{
			update_option( $tpl['instance_id'], $new );

	}
	update_option ('kb_block_templates', $saved);
	
	$old = get_option($tpl['instance_id']);
	
	$location = add_query_arg(array('message' => 'updated','action' => false));
	wp_redirect($location);
	
	
}

function kb_delete_block_template_callback()
{
	if (empty($_REQUEST['template']))
		wp_die('No Template specified.');
	
	$template = $_REQUEST['template'];
	
	$option = get_option('kb_block_templates');
	
	unset($option[$template]);
	
	update_option('kb_block_templates', $option);
	
	$location = add_query_arg(array('message' => 'deleted','action' => false));
	wp_redirect($location);
	
}