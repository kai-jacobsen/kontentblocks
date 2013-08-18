<?php
global $current_screen;
$templateables = $Kontentblocks->get_templateables();


echo "	<form method='POST' action='admin.php?page={$current_screen->parent_base}'>
	<input type='hidden' name='action' value='add-template' >
	
		<div class='kb_page_wrap'>
				<div class='kb_options_header'>
					<div id='icon-options-general' class='icon32'></div>
					<h2>Vorlagen für Inhaltsblöcke</h2>
				</div>";
					do_action('kb_admin_notices');

echo "		<div class='kb_options_section create-new-block-template'>
			
			<div class='kb_field'>
			<label class='kb_label heading'>Typ auswählen</label>
			<select name='class' class='chzn blocks'>
			<option value='null'>Bitte wählen</option>";

				foreach ($templateables as $classname => $block)
				{

echo "				<option value=" . get_class($block) .">{$block->name}</option>";
				}

echo "		</select></div>";

echo "		<div class='template-name kb_field'>
				<label class='kb_label heading'>Bezeichnung</label>
				<input type='text' name='template_name' value='' />
			</div>
			<div class='template-master kb_field'>
			<label class='kb_label heading'>Master</label>
			<input type='checkbox' name='template_master' value='1' />
			</div>
			<input type='submit' class='button-primary' value='Template erstellen' />
			</div></form>";
// Area Table
echo "<div class='kb_options_section block_templates_table'>";
echo "<h2>Erstellte Vorlagen bearbeiten</h2>";
$kb_block_templates_table->prepare_items();
$kb_block_templates_table->display();
echo "<div>";
echo "</div>";