<?php

if ( is_user_logged_in() && !(is_admin()) && current_user_can( 'manage_kontentblocks') &&  apply_filters('kb.config.initFrontend', true) ) {
    add_action( 'admin_bar_menu', 'toolbar_edit_control', 999 );
}

function toolbar_edit_control( $wp_admin_bar ) {

    $i18n = \Kontentblocks\Language\I18n::getPackage('Extensions.adminBar');

    $args = array(
    'id' => 'kb-edit-switch',
    'title' => $i18n['showEditable'],
	'href'	=> '#',
    'meta' => array('class' => 'kb-edit-switch', 'onclick' => 'KB.App.adminBar.control(this);')
  );

  $wp_admin_bar->add_node($args);
}

add_filter('heartbeat_received', 'hbreceived', 10, 2);
function hbreceived($response, $data){

    $check = false;

    if (isset($data['kbEditWatcher'])){
        wp_send_json($data['kbEditWatcher']);
        $user = wp_check_post_lock($data['kbEditWatcher']);
        if ($user !== false){
            $user = array(
                'locked' => true,
                'userID' => wp_check_post_lock($data['kbEditWatcher']),
                'userMeta' => get_user_meta(wp_check_post_lock($data['kbEditWatcher']))
            );
        }

        $response['kbEditWatcher'] = $user;
    }

    return $response;

}