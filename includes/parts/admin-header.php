<?php

use Kontentblocks\Hooks\Enqueues;

// Main Kontentblocks script file
wp_enqueue_style( 'wp-admin' );
wp_enqueue_style( 'buttons' );
wp_enqueue_style( 'colors' );
wp_enqueue_style( 'ie' );
wp_enqueue_script( 'link' );

$current_screen = WP_Screen::get();


$admin_body_class = preg_replace( '/[^a-z0-9_-]+/i', '-', $hook_suffix );

@header( 'Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option( 'blog_charset' ) );

wp_user_settings();
_wp_admin_html_begin();
?>
<script type="text/javascript">
    addLoadEvent = function(func) {
        if (typeof jQuery != "undefined")
            jQuery(document).ready(func);
        else if (typeof wpOnload != 'function') {
            wpOnload = func;
        } else {
            var oldonload = wpOnload;
            wpOnload = function() {
                oldonload();
                func();
            }
        }
    };
    var userSettings = {
        'url': '<?php echo SITECOOKIEPATH; ?>',
        'uid': '<?php if ( !isset( $current_user ) ) $current_user = wp_get_current_user(); echo $current_user->ID; ?>',
        'time': '<?php echo time() ?>'
    },
    ajaxurl = '<?php echo admin_url( 'admin-ajax.php', 'relative' ); ?>',
            adminpage = '<?php echo $admin_body_class; ?>',
            thousandsSeparator = '<?php echo addslashes( $wp_locale->number_format[ 'thousands_sep' ] ); ?>',
            decimalPoint = '<?php echo addslashes( $wp_locale->number_format[ 'decimal_point' ] ); ?>',
            isRtl = <?php echo ( int ) is_rtl(); ?>;
</script>

<?php
do_action( 'admin_enqueue_scripts', $hook_suffix );
do_action( "admin_print_styles-$hook_suffix" );
do_action( 'admin_print_styles' );
do_action( "admin_print_scripts-$hook_suffix" );
do_action( 'admin_print_scripts' );
do_action( "admin_head-$hook_suffix" );
do_action( 'admin_head' );
wp_enqueue_script( 'Kontentblocks-Fields', KB_PLUGIN_URL . '/dist/min/fields.min.js', array( 'jquery', 'backbone', 'underscore', 'wp-color-picker', 'kontentblocks-base' ), '0.7', true );
$Enqueue = new Enqueues();
$Enqueue->addStyle( 'onsite-styles', KB_PLUGIN_URL . 'css/OSinlinestyles.css' );
$Enqueue->enqueue();
?>
</head>

