<?php

add_action('kb_capabilities_overview', 'kb_capabilities_overview_callback');
add_action('kb_capabilities_update', 'kb_capabilities_update_callback');
add_action('kb_capabilities_reset', 'kb_capabilities_reset_callback');


/**
 * Switch to handle apprpiate actions 
 */
function kb_capabilities_page()
{
	$action = ( isset($_GET['action']) ) ? $_GET['action'] : false;
	
	switch ($action)
	{
		case false:
			do_action('kb_capabilities_overview');
		break;
		
		case 'update':
			do_action('kb_capabilities_update');
		break;
	
		case 'reset':
			do_action('kb_capabilities_reset');
		break;
	}
}


/**
 * Overview Page
 * 
 * @global object $Kontentblocks 
 */
function kb_capabilities_overview_callback()
{
	global $Kontentblocks;
	
	// Prepare data
	$roles		= _kb_get_roles();
	$kbcaps		= $Kontentblocks->caps;
	$option = get_option('kontentblocks_capabilities');
	
	// assume that the admin has all available caps, would make sense
	$kballcaps	= $kbcaps['administrator'];
	
	$html = "<div class='kb_page_wrap'>
			<form action='admin.php?page=kontentbilities&action=update' method='post' >
				<div class='kb_options_header'>
					<div id='icon-options-general' class='icon32'></div>
					<h2>Edit Capabilities</h2>
				</div>
	
			<div class='area_edit_tabs'>
				<ul>";
					foreach ($roles as $role => $name)
					{
	$html.="			<li><a href='#{$role}'>{$name}</a></li>";
					}
	$html.="	</ul>";
	
				foreach ($roles as $role => $name)
				{
					$thisrolecaps = ( ! empty($option[$role]) ) ? $option[$role] : array();
					$html.= _kb_get_cap_markup($role, $thisrolecaps, $kballcaps);
				}
					
	$html.="</div>
			<input type='submit' class='button-primary' value='update' >
			<a href='admin.php?page=kontentbilities&action=reset' class='button'>reset</a>
			</form>
			</div>";
	
	echo $html;
}


/**
 * Helper to get Role Names
 */
function _kb_get_roles()
{
	global $wp_roles;
	
	$roles = array();
	if (empty($wp_roles)) return $roles;
	
	foreach ($wp_roles->role_names as $role => $name)
	{
		$roles[$role] = $name;
	}
	
	return $roles;
	
	
}



/**
 * Helper creates the div container for tabs, create checkboxes for all caps and check which are assigned 
 * 
 * @param string $role
 * @param array $caps
 * @param array $kballcaps
 * @return string 
 */
function _kb_get_cap_markup($role, $caps, $kballcaps)
{
	$html = "<div id='{$role}'>
			<table>";
				
			foreach($kballcaps as $cap)
			{
				$checked = null;
				if (!empty($caps) && is_array($caps))
				{
					$checked = (in_array($cap, $caps)) ? 'checked="checked"' : null;
				}
				
				if ($role == 'administrator' && ( $cap == 'manage_kontentblocks' || $cap == 'admin_kontentblocks' ))
				{
	$html.= "<tr>
				<td><input type='checkbox' name='caps[{$role}][]' value='{$cap}' id='{$role}_{$cap}' checked='checked' disabled='disabled' ></td>
				<input type='hidden' name='caps[{$role}][]' value='{$cap}' id='{$role}_{$cap}' >
				<td><label for='{$role}_{$cap}'>{$cap}</label></td>
			 </tr>";					
				}
				else
				{
	$html.= "<tr>
				<td><input type='checkbox' name='caps[{$role}][]' value='{$cap}' id='{$role}_{$cap}' {$checked} ></td>
				<td><label for='{$role}_{$cap}'>{$cap}</label></td>
			 </tr>";					
				}
				

			}
		
	$html .="</table>
			</div>";
	return $html;
}

/**
 * Update action 
 */
function kb_capabilities_update_callback()
{
	global $Kontentblocks;
	
	if ( ! empty( $_POST['caps'] ))
	{
		update_option('kontentblocks_capabilities', $_POST['caps']);
	
	
	$reset = _kb_capabilities_reset_all();
	
	$Kontentblocks->_setup_capabilities();
	
	}
	
	$location = add_query_arg(array('message' => '1', 'action' => false));
	wp_redirect($location);
}


/**
 * Removes all caps from all roles, just to be safe
 * 
 * @global object $Kontentblocks
 * @global object $wp_roles 
 */
function _kb_capabilities_reset_all()
{
	global $Kontentblocks, $wp_roles;
	
	// assume that the administrator has all caps
	$kballcaps = $Kontentblocks->caps['administrator'];
	
	// for all registered roles, remove caps
	foreach( $wp_roles->role_names as $role => $name )
	{
		$object = get_role($role);
		
		foreach ($kballcaps as $cap)
		{
			if (( $cap == 'manage_kontentblocks' || $cap == 'admin_kontentblocks') && $role = 'administrator') continue;
			$object->remove_cap($cap);
		}
	}
}

/**
 * Callback for reset action
 * 
 * Sets capabilities back to defaults, initial assignment as of kontentblocks.php
 * 
 * @global object $Kontentblocks 
 */

function kb_capabilities_reset_callback()
{
	global $Kontentblocks;
	
	// remove all caps
	_kb_capabilities_reset_all();
	
	// to be safe, remove the option completly
	delete_option('kontentblocks_capabilities');
	
	// re-init caps
	$Kontentblocks->_setup_capabilities();
	
	// store new option
	update_option('kontentblocks_capabilities', $Kontentblocks->caps);
	
	$location = add_query_arg(array('message' => '1', 'action' => false));
	wp_redirect($location);
	
	
}