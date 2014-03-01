<?php

namespace Kontentblocks\Tables;

add_action('plugins_loaded', '\Kontentblocks\Tables\init');

function init()
{

    $dbVersion = get_option('kb_dbVersion');
    if ($dbVersion !== '1.0.12') {
        global $wpdb;

        $backups = $wpdb->prefix . "kb_backups";

        $sql = "CREATE TABLE $backups (
  id mediumint(9) NOT NULL AUTO_INCREMENT,
  created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
  updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
  post_id mediumint(9),
  value longtext NOT NULL,
  literal_id VARCHAR(64) DEFAULT '' NOT NULL,
  PRIMARY KEY  (id)
    );";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        update_option("kb_dbVersion", '1.0.12');
    }
}