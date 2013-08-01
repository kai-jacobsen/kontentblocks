<?php


global $Kontentblocks, $Kontentbox, $current_screen;

	$Kontentblocks->set_post_context( false );
if ( isset($_GET['area']))
{
	$area_id = $_GET['area'];
}
else
{
	die('Something wrong here Baby!');
}

wp_enqueue_script('dynamic_areas', KB_PLUGIN_URL . '/js/dynamic_areas.js', array('kontentblocks-base'), true,true);

// get areas data
/*$areas = get_option('kb_registered_areas');*/
$areas = $Kontentblocks->areas;
$area = $areas[$area_id];
$d_areas = get_option('kb_dynamic_areas');
$dareas_settings = get_option('kb_dynamic_areas_settings');

$blocks = (!empty($d_areas[$area_id])) ? $d_areas[$area_id] : null;

if (!empty($blocks))
	$blocks = $Kontentblocks->_setup_blocks($blocks);

$html ="	<div class='kb_page_wrap'>
				<div class='kb_options_header'>
					<div id='icon-options-general' class='icon32'></div>
					<h2>Kontentblocks Areas</h2>
					
				</div>";
echo $html;
		echo "<div style='display: none;'>";
		wp_editor('','content');
		echo '</div>';
		wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );

		// get blocks for used on this post from prepared data
		
		// prepare base id for new blocks
		if ( !empty( $blocks ) )
		{
			
			$base_id = $Kontentbox->_get_highest_id( $blocks  );
		} 
		else
		{
			$base_id = 0;
		}

		// add a hidden field to the meta box, javascript will use this
		echo '<input type="hidden" id="kb_all_blocks" value="' . $base_id . '" />';
		echo '<input type="hidden" id="post_ID" value="0" />';
		echo "<form action='admin.php?page=dynamic_areas&action=update&area={$area['id']}' method='post'>";
		echo '<div id="kontentblocks_stage">';
		echo "<div class='dynamic_area_list'>";
				
				$area = new KBArea($area);
				$area->_do_area_header();
				$area->blocks = $blocks;
				$area->do_area_blocks();
		echo "</div></div>
				<input class='button-primary' type='submit' value='update' >
				</form>";
// Area Table
echo "<div class='kb_options_section area_table'>";

echo "</div>";

?>
