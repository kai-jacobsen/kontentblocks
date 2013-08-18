<?php


global $Kontentblocks, $current_screen;

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

$redirect = (!empty($_GET['redirect'])) ? wp_get_referer() : false;

// show form


echo "
	<div class='block-template-wrapper kb_page_wrap'>
		<div class='kb_options_header'>
			<h2>{$instance->name}</h2>
		</div>
		<form action='admin.php?page={$current_screen->parent_base}&action=update&id={$template['instance_id']}' method='POST' >
		<input type='hidden' id='post_ID' value='0' >
		<input type='hidden' name='redirect' value='{$redirect}' />
			<div id='kontentblocks_stage'>
				<div id='{$instance->instance_id}' class='kb_block'>";
		
			$instance->options($data);
echo "
			</div></div>
			<input type='submit' value='update' class='button-primary' />
		</form>
	</div>";
?>
