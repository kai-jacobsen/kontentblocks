<?php

add_action('wp_ajax_tb_edit_dynamic_areas', 'tb_edit_dynamic_areas_cb');

// show action
add_action('tb_show_dynamic_area', 'tb_show_dynamic_area_cb');

function tb_edit_dynamic_areas_cb()
{
	if ( ! isset( $_GET['inline'] ) )
		define( 'IFRAME_REQUEST' , true );


	if (!current_user_can('manage_kontentblocks'))
		wp_die(__('You do not have permission to upload files.'));


	if ( !isset($_GET['daction']))
		wp_die(__(''));
	
	// switch
	
	switch ($_GET['daction'])
	{
		case 'show':
			do_action('tb_show_dynamic_area');
		break;
	
		case 'update':
			// defined in kb.options.areas-dynamic.php
			do_action('kontentblocks-sidebars-update');
		break;
	}

	exit;
}

/*
 * Contents of the thickbox
 * 
 */

function tb_show_dynamic_area_cb()
{
	global $hook_suffix, $Kontentblocks, $Kontentbox, $wp_version, $current_screen, $current_user, $wp_locale;

	if ( isset($_GET['area']))
	{
		$area_id = $_GET['area'];
	}
	else
	{
		die('Something wrong here Baby!');
	}

	// prepare Kontentblocks
	$Kontentblocks->set_post_context( false );
	
	// Main Kontentblocks script file
	wp_enqueue_style( 'wp-admin' );
	wp_enqueue_style( 'buttons' );
	wp_enqueue_style( 'colors' );
	wp_enqueue_style( 'ie' );
	wp_enqueue_script('link');
	
	$Kontentblocks->enqueue_files();
	wp_enqueue_script('dynamic_areas', KB_PLUGIN_URL . '/js/dynamic_areas.js');

	$admin_body_class = preg_replace('/[^a-z0-9_-]+/i', '-', $hook_suffix);

	@header('Content-Type: ' . get_option('html_type') . '; charset=' . get_option('blog_charset'));
	
	wp_user_settings();
	_wp_admin_html_begin();
	
	// IDs should be integers
	$ID = isset($ID) ? (int) $ID : 0;
	$post_id = isset($post_id)? (int) $post_id : 0;

	?>
	<script type="text/javascript">
		addLoadEvent = function(func){if(typeof jQuery!="undefined")jQuery(document).ready(func);else if(typeof wpOnload!='function'){wpOnload=func;}else{var oldonload=wpOnload;wpOnload=function(){oldonload();func();}}};
		var userSettings = {
			'url': '<?php echo SITECOOKIEPATH; ?>',
			'uid': '<?php if ( ! isset($current_user) ) $current_user = wp_get_current_user(); echo $current_user->ID; ?>',
			'time':'<?php echo time() ?>'
		},
			ajaxurl = '<?php echo admin_url( 'admin-ajax.php', 'relative' ); ?>',
			adminpage = '<?php echo $admin_body_class; ?>',
			thousandsSeparator = '<?php echo addslashes( $wp_locale->number_format['thousands_sep'] ); ?>',
			decimalPoint = '<?php echo addslashes( $wp_locale->number_format['decimal_point'] ); ?>',
			isRtl = <?php echo (int) is_rtl(); ?>;
	</script>

	<?php

		if ( !isset($_GET['inline']) ) {
		do_action('admin_enqueue_scripts', $hook_suffix);
		do_action("admin_print_styles-$hook_suffix");
		do_action('admin_print_styles');
		do_action("admin_print_scripts-$hook_suffix");
		do_action('admin_print_scripts');
		do_action("admin_head-$hook_suffix");
		do_action('admin_head');

		$admin_body_class .= ' branch-' . str_replace( array( '.', ',' ), '-', floatval( $wp_version ) );
		$admin_body_class .= ' version-' . str_replace( '.', '-', preg_replace( '/^([.0-9]+).*/', '$1', $wp_version ) );
		$admin_body_class .= ' admin-color-' . sanitize_html_class( get_user_option( 'admin_color' ), 'fresh' );
		$admin_body_class .= ' locale-' . sanitize_html_class( strtolower( str_replace( '_', '-', get_locale() ) ) );
		$admin_body_class .= ' kb-area-overlay';
		?>
		</head>

		<body class="wp-admin no-js <?php echo apply_filters( 'admin_body_class', '' ) . " $admin_body_class"; ?>">
		<script type="text/javascript">document.body.className = document.body.className.replace('no-js','js');</script>
		<?php

				echo "<div style='display: none;'>";
				wp_editor('','content');
				echo '</div>';
		// get areas data
		$areas = $Kontentblocks->get_areas();
		$area = $areas[$area_id];
		$d_areas = get_option('kb_dynamic_areas');
		$dareas_settings = get_option('kb_dynamic_areas_settings');

		$blocks = (!empty($d_areas[$area_id])) ? $d_areas[$area_id] : null;

		if (!empty($blocks))
			$blocks = $Kontentblocks->_setup_blocks($blocks);

		echo "<form action='admin-ajax.php?action=tb_edit_dynamic_areas&daction=update&area={$area['id']}&ext=1' method='post'>";
		echo"	<div class='kb_page_wrap kb_tb_dynamic_area kb_thickbox'>
					<div class='area-holder'>";
		

				wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );

				// prepare base id for new blocks
				if ( !empty( $blocks ) )
				{
					$base_id = $Kontentbox->_get_highest_id( $blocks );
				} 
				else
				{
					$base_id = 0;
				}

				// add a hidden field to the meta box, javascript will use this
				echo '<input type="hidden" id="kb_all_blocks" value="' . $base_id . '" />';
				echo '<input type="hidden" id="post_ID" value="0" />';
				
				echo '<div id="kontentblocks_stage">';
				echo "<div class='dynamic_area_list'>";

						$area = new KBArea($area);
						$area->_do_area_header();
						$area->blocks = $blocks;
						$area->do_area_blocks();
						
				echo "</div>
					</div>
					</div>
						<input class='primary-button' type='submit' value='Änderungen speichern' >
						</form>";

		do_action('admin_footer', '');
		do_action('admin_print_footer_scripts');
		do_action("admin_footer-" . $GLOBALS['hook_suffix']);
		
		echo '</body></html>';
		}
		
}