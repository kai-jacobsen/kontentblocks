<?php

namespace Kontentblocks\Backend\Templates;

// Actions
add_action( 'admin_menu', 'Kontentblocks\Backend\Templates\add_menu');
add_action('init', 'Kontentblocks\Backend\Templates\action_switch',666);

add_action('delete_module_template', __NAMESPACE__ .'\\delete');
add_action('update_module_template', __NAMESPACE__ .'\\update');

// table view
include 'kontentblocks.table.templates.php';



// Add menu page
function add_menu(){
	
	$kb_sidebars = add_menu_page('Kontentblocks Templates', 'Templates', 'manage_kontentblocks', 'kontentblocks-templates', 'Kontentblocks\Backend\Templates\init');
	add_submenu_page('kontentblocks-templates', 'Overview', 'All Templates', 'manage_kontentblocks', 'kontentblocks-templates');
};


// Init
function init() {
	
	global $Kontentblocks;
	// intatiate table class
	$kb_block_templates_table = new KB_Block_Templates();
	
	
	// get action
	$action = ($kb_block_templates_table->current_action());
	
	switch ($action)
	{	

		case 'edit_template':
			include plugin_dir_path( __FILE__ ) . 'kontentblocks.menu.modules.templates.edit.php';
		break;
		
		case false:
		default:
			include plugin_dir_path( __FILE__ ) . 'kontentblocks.view.table.templates.php';
		break;
	};
}

function action_switch()
{

	if (isset($_GET['page']) && $_GET['page'] == 'kontentblocks-templates')
	{
		if ( (isset($_REQUEST['action']) && !empty($_REQUEST['action']) ) )
		{
			$action = ($_REQUEST['action'] == '-1') ? $_REQUEST['action2'] : $_REQUEST['action'];

			switch ($action)
			{

                case 'add-template':
                    include plugin_dir_path( __FILE__ ) . 'kontentblocks.menu.modules.templates.add.php';
                break;
                
                case 'update':
                    do_action('update_module_template');
                break;

                case 'delete_template':
                    do_action('delete_module_template');
                break;

			}
		}
	}
}


function update()
{
	global $Kontentblocks, $Kontentbox;
	if (!isset($_REQUEST['id']))
		wp_die('No ID specified');
	
	$saved = get_option('kb_block_templates');
	$tpl = $saved[$_REQUEST['id']];
	
	$redirect = (!empty($_REQUEST['redirect'])) ? $_REQUEST['redirect'] : false;
	

	
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
	
	if (!$redirect)
		$location = add_query_arg(array('message' => 'updated','action' => false));
	else
		$location = $redirect;
	wp_redirect($location);
	
	
}

function delete()
{
	if (empty($_REQUEST['template']))
		wp_die('No Template specified.');
	
	$template = $_REQUEST['template'];
	
	$option = get_option('kb_block_templates');
	
	unset($option[$template]);
	
	update_option('kb_block_templates', $option);
	
	delete_option($template);
	
	$location = add_query_arg(array('message' => 'deleted','action' => false));
	wp_redirect($location);
	
}