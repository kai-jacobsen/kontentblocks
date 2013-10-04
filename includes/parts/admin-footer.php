<?php
echo "</div>
<div class='context-footer'>
    <style>html {height: auto !important;  } </style>
</div></div></form></div></div>";

do_action( 'admin_footer', '' );
do_action( 'admin_print_footer_scripts' );
do_action( "admin_footer-" . $GLOBALS[ 'hook_suffix' ] );
echo "<script>"
            ."jQuery('.nano').nanoScroller();thiswindow = jQuery(window).height();
            jQuery('.content').height(thiswindow - 50);
            jQuery(document).ready(function(){
    jQuery('#kontentblocks_stage').css('visibility', 'inherit');
    }); "
            ."</script>";
echo '</body></html>';
exit;