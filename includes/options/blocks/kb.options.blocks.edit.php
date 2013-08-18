<?php

if ( isset($_GET['block']))
{
	$block_id = $_GET['block'];
}
else
{
	die('Something wrong here Baby!');
}

// get data
$blocks = get_option('kb_block_options');
$block = $blocks[$block_id];


$before_block = stripslashes($block['before_block']);
$after_block = stripslashes($block['after_block']);


$html = "
	<form action='admin.php?page=blocks&action=update&block={$block_id}' method='post' />
		<div class='kb_page_wrap'>
			<div class='kb_options_header'>
				<div id='icon-options-general' class='icon32'></div>
				<h2>Edit Block</h2>
			</div>
			
			<div class='option_field'>

				<div class='kb_field'>
					<label for='block_name'>Status</label>";
					$checked = ($block['disable'] == 'disable') ? 'checked="checked"' : '';
$html.= "			<input type='checkbox' name='new_block[disable]' value='disable' {$checked} >
					<p class='description'> Disable this block globally</p>
				</div>
				
				<div class='kb_field'>
					<label for='block_name'>Public Name</label>
					<input type='text' name='new_block[public_name]' value='{$block['public_name']}' >
					<p class='description'> Public Name as it shows upon creation</p>
				</div>
					
				<div class='kb_field'>
					<label for='block_name'>Description</label>
					<input type='text' class='regular-text' name='new_block[description]' value='{$block['description']}' >
					<p class='description'> Public Name as it shows upon creation</p>
				</div>
					
				<div class='kb_field'>
					<label for='block_name'>Wrapper</label>";
					$checked = ($block['wrapper'] == 'usewrapper') ? 'checked="checked"' : '';
$html.= "			<input type='checkbox' name='new_block[wrapper]' value='usewrapper' {$checked} >
					<p class='description'> Use before and after markup</p>
				</div>
					
				<div class='kb_field'>
					<label for='block_name'>Before Block</label>
					<input type='text' class='regular-text' name='new_block[before_block]' value='{$before_block}' >
					<p class='description'> HTML before block</p>
					
					<label for='block_name'>After Block</label>
					<input type='text' class='regulat-text' name='new_block[after_block]' value='{$after_block}' >
					<p class='description'> HTML after block</p>
				</div>
			</div>
			<input type='submit' class='button-primary' value='update block' >
		</form>";

echo $html;
