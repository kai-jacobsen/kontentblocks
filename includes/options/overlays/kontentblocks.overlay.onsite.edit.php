<?php

add_action('wp_ajax_os_edit_block', 'os_edit_block_callback');
add_action('tb_update_os_block', 'tb_update_os_block_cb');
// show action
add_action('tb_show_edit_block', 'tb_show_edit_block_cb');

function os_edit_block_callback()
{
	if (! wp_verify_nonce($_GET['_wpnonce'], 'onsiteedit') ) die("Cheatin uhh?");
	
	if ( ! isset( $_GET['inline'] ) )
		define( 'IFRAME_REQUEST' , true );

	if ( !defined('ONSITE_EDIT') )
		define( 'ONSITE_EDIT' , true );

	if (!current_user_can('manage_kontentblocks'))
		wp_die(__('Action not allowed'));


	if ( !isset($_GET['daction']))
		wp_die(__(''));
	
	// switch
	
	switch ($_GET['daction'])
	{
		case 'show':
			do_action('tb_show_edit_block');
		break;
	
		case 'update':
			// defined in kb.options.areas-dynamic.php
			do_action('tb_update_os_block');
		break;
	}

	exit;
}

/*
 * Contents of the thickbox
 * 
 */

function tb_show_edit_block_cb()
{
	global $hook_suffix, $Kontentblocks, $Kontentbox, $wp_version, $current_screen, $current_user, $wp_locale;
	
	$instance_id = $_GET['instance'];
	$post_id = $_GET['post_id'];
	$class = $_GET['class'];
	$area_context = $_GET['area_context'];
	$columns = $_GET['columns'];
	$post_context = $_GET['context'];
	$subcontext = $_GET['subcontext'];
	$page_template = $_GET['page_template'];
	$post_type = $_GET['post_type'];
	
	
	
	if ('true' == $post_context)
	{
		$data = get_post_meta($post_id, '_'.$instance_id, true);	
	}
	elseif ('false' == $post_context)
	{
		$data = get_option($instance_id, array());
		
	}

	
	// Main Kontentblocks script file
	wp_enqueue_style( 'wp-admin' );
	wp_enqueue_style( 'buttons' );
	wp_enqueue_style( 'colors' );
	wp_enqueue_style( 'ie' );
	wp_enqueue_script('link');
	
	
	$admin_body_class = preg_replace('/[^a-z0-9_-]+/i', '-', $hook_suffix);

	@header('Content-Type: ' . get_option('html_type') . '; charset=' . get_option('blog_charset'));
	
	wp_user_settings();
	_wp_admin_html_begin();
	
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
		$admin_body_class .= ' wp-core-ui';
		$admin_body_class .= ' on-site-editing';
		?>
		</head>

		<body class="wp-admin no-js <?php echo apply_filters( 'admin_body_class', '' ) . " $admin_body_class"; ?>">
			<div class="os-wrapper" id="kontentblocks_stage">
		<script type="text/javascript">document.body.className = document.body.className.replace('no-js','js');</script>
		<?php
			echo "<div style='display: none;'>";
				wp_editor('','content');
			echo '</div>';

		$admin = admin_url();
		
		$nonce = wp_create_nonce('onsiteedit');
		
		$l18n_save = __('Änderung speichern', 'kontentblocks');
	
		echo "<form action='{$admin}/admin-ajax.php?action=os_edit_block&daction=update&ext=1&_wpnonce={$nonce}' method='post'>";
		echo"	<div class='kb_page_wrap kb_tb_dynamic_area kb_thickbox'>
				<input type='hidden' name='post_id' value='{$post_id}' >
				<input type='hidden' name='post_ID' id='post_ID' value='{$post_id}' >
				<input type='hidden' name='instance_id' value='{$instance_id}' >
				<input type='hidden' name='class' value='{$class}' >
				<input type='hidden' name='columns' value='{$columns}' >
				<input type='hidden' name='context' value='{$post_context}' >
				<input type='hidden' name='subcontext' value='{$subcontext}' >
				<input type='hidden' name='area_context' value='{$area_context}' >
				<input type='hidden' name='page_template' value='{$page_template}' >
				<input type='hidden' name='post_type' value='{$post_type}' >
				<div class='os-header bar'>
					<input class='os-update' type='submit' value='{$l18n_save}' >
				</div>
					<div class='area-holder'>";
		

		wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );
		$Kontentblocks->enqueue_files();
		
		echo "<div class='kb_block' id='{$instance_id}'>";
		
		$instance = $Kontentblocks->blocks[$class];
		$instance->instance_id = $instance_id;
		$instance->area_context = $area_context;
		$instance->subcontext = $subcontext;
		$instance->colums = $columns;
		$instance->post_id = $post_id;
		$instance->options($data);
		$instance->page_template = $page_template;
		$instance->post_type = $post_type;
		
		echo "</div>
			<div class='context-footer'>
							<style>html {height: auto !important;  } </style>
						</div></div></form></div>";
		
		do_action('admin_footer', '');
		do_action('admin_print_footer_scripts');
		do_action("admin_footer-" . $GLOBALS['hook_suffix']);
		
		echo '</body></html>';
		}
		
}

function tb_update_os_block_cb()
{
	global $Kontentblocks;
	
	$update			= true;
	$post_context	= $_POST['context'];
	$post_id		= $_POST['post_id'];
	$instance_id	= $_POST['instance_id'];
	$class			= $_POST['class'];
	$area_context	= $_POST['area_context'];
	$columns		= $_POST['columns'];
	$subcontext		= $_POST['subcontext'];
	$page_template	= $_POST['page_template'];
	$post_type		= $_POST['post_type'];
	
	$old = get_post_meta($post_id, '_'.$instance_id, true);
	$data = (isset($_POST[$instance_id])) ? $_POST[$instance_id] : null;
	
	$instance = $Kontentblocks->blocks[$class];
	$instance->columns = $columns;
	$instance->area_context = $area_context;
	$instance->post_id = $post_id;
	$instance->subcontext = $subcontext;
	$instance->page_template = $page_template;
	$instance->post_type = $post_type;
	$new = $instance->save($old, $instance_id, $data);
	
	if ('false' == $post_context)
		$Kontentblocks->set_post_context(false);
	else
		$Kontentblocks->set_post_context(true);
	
	$instance->new_instance = $new;
	
	// store new data in post meta
	if ( $new && $new != $old )
	{
		if ('true' == $post_context)
		{
			$update = update_post_meta( $post_id, '_' . $instance_id, $new );
		}
		elseif ('false' == $post_context)
		{
			$update = update_option($instance_id, $new);
		}
	
	}
	
	if ( true === $new)
		$update = true;
	
	if ($update == true)
	{
		$instance->instance_id = $instance_id;
		$result = array(
			'output' => stripslashes($instance->block($new)).$instance->print_edit_link($post_id),
			'callback' => $instance->id
		);

		$json = (json_encode($result));
		
		// delete transient for this block
		delete_transient($instance->instance_id);
		
		
		// call script
		echo "<script>
				var win = window.dialogArguments || opener || parent || top;
				win.KBOnSiteEditing.refresh({$json});
			</script>";
	}
	else
	{
			echo "<script>
				var win = window.dialogArguments || opener || parent || top;
				win.KBOnSiteEditing.shutdown();
			</script>";
	}
	
	
}