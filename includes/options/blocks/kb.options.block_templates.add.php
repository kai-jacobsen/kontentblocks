<?php


global $Kontentblocks;

// TODO: check add nonce

// set Kontentblocks post context
$Kontentblocks->set_post_context(false);

if (!isset($_REQUEST['class']) )
	wp_die ('Whooops, Big Whoop is not here!', 'I\'m Guybrush Threepwood');

$name = (!empty($_REQUEST['template_name'])) ? $_REQUEST['template_name'] : 'unbenannt';

				echo "<div style='display: none;'>";
				wp_editor('','content');
				echo '</div>';
// saved templates
$option = get_option('kb_block_templates');

$tpl_count = count($option);
if ( $tpl_count >= 1 )
	{
		$kb_tpl_count = $tpl_count + 1;
	}
	else
	{
		$kb_tpl_count = 1;
	};

$class = $_REQUEST['class'];
$instance = $Kontentblocks->blocks[$class];
$kb_new_id = "kb_block_template_{$kb_tpl_count}";



// prepare new block data
$new_block = array(
	'id' => $instance->id,
	'instance_id' => $kb_new_id,
	'area' => null,
	'class' => $class,
	'name' => $name,
	'status' => '',
	'draft' => 'true',
	'locked' => 'false',
	'template' => true
);

$option[$kb_new_id] = $new_block;


update_option('kb_block_templates', $option);
echo "<div style='width: 75%'>";
$instance->area_context = 'template';
$instance->instance_id = $kb_new_id;
echo "</div>";








echo "
	<div class='block-template-wrapper' style='width: 75%'>
		<form action='admin.php?page=block_templates&action=update&id={$kb_new_id}' method='POST' >
		<input type='hidden' id='post_ID' value='0' >
			<div id='kontentblocks_stage'>";
		
			$instance->options(null);
echo "
			</div>
			<input type='submit' value='update' class='button-primary' />
		</form>
	</div>";



?>
