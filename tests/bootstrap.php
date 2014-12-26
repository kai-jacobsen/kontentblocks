<?php

use Kontentblocks\Kontentblocks;

$_tests_dir = getenv( 'WP_DEVELOP_DIR' );
if (!$_tests_dir) {
    $_tests_dir = '/tmp/wordpress/wordpress-tests-lib';
}

define('TESTS_DIR', dirname(__FILE__));

require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin()
{
    require dirname( __FILE__ ) . '/../kontentblocks.php';
    add_theme_support( 'kontentblocks' );

    $dbVersion = get_option( 'kb_dbVersion' );
    if ($dbVersion !== Kontentblocks::TABLEVERSION) {
        global $wpdb;

        $backups = $wpdb->prefix . "kb_backups";

        $sql = "CREATE TABLE $backups (
  id mediumint(9) NOT NULL AUTO_INCREMENT,
  created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
  updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
  post_id mediumint(9),
  value longtext NOT NULL,
  PRIMARY KEY  (id)
    );";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
        update_option( "kb_dbVersion", Kontentblocks::TABLEVERSION );
    }




}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );


require $_tests_dir . '/includes/bootstrap.php';