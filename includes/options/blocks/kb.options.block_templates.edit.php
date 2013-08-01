<?php


global $Kontentblocks;


// TODO: check edit nonce, check cap

// set Kontentblocks post context
$Kontentblocks->set_post_context(false);

if (!isset($_GET['template']))
	wp_die('No Template set to Edit');

$saved = get_option('kb_block_templates');

$template = $saved[$_GET['template']];

if (empty($template))
	wp_die('This template does not exist');

$instance = new $template['class'];
$instance->instance_id = $template['instance_id'];
$instance->area_context = 'template';

$data = get_option($template['instance_id']);

// show form


echo "
	<div class='block-template-wrapper' style='width: 75%'>
		<form action='admin.php?page=block_templates&action=update&id={$template['instance_id']}' method='POST' >
		<input type='hidden' id='post_ID' value='0' >
			<div id='kontentblocks_stage'>";
		
			$instance->options($data);
echo "
			</div>
			<input type='submit' value='update' class='button-primary' />
		</form>
	</div>";
?>
