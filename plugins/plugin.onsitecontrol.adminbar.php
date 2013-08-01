<?php

use Kontentblocks\AdminBar;


if (  is_user_logged_in() && !(is_admin()))
	add_action( 'admin_bar_menu', 'toolbar_os_control', 999 );

function toolbar_os_control( $wp_admin_bar ) {
  $args = array(
    'id' => 'os-support',
    'title' => 'Onsite Editing',
	'href'	=> '#',
    'meta' => array('class' => 'os-edit os-edit-off', 'onclick' => 'KBOnSiteEditing.control(this);')
  );

  $wp_admin_bar->add_node($args);
}