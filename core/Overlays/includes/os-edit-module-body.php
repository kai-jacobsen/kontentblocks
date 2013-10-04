<?php
use Kontentblocks\Helper;
?>
<body class="wp-admin no-js <?php echo apply_filters( 'admin_body_class', '' ) . " $admin_body_class"; ?>">
    <div id="root-container" class="nano">	
        <div class="os-wrapper content" id="kontentblocks_stage" style="visibility: hidden;">
            <script type="text/javascript">document.body.className = document.body.className.replace('no-js', 'js');</script>
            <?php
            // render reference Editor instance
            Helper\getHiddenEditor();

            $admin = admin_url();

            $nonce = wp_create_nonce( 'onsiteedit' );

            $l18n_save = __( 'Änderung speichern', 'kontentblocks' );

            echo "<form action='{$admin}/admin-ajax.php?action=os-edit-module&daction=update&ext=1&_wpnonce={$nonce}' method='post'>";
            wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );
            echo" 
                <div class='kb_page_wrap kb_tb_dynamic_area kb_thickbox'>
                {$this->inputs()}
				<div class='os-header bar'>
					<input class='os-update' type='submit' value='{$l18n_save}' >
				</div>
					<div class='area-holder'>";
            echo "<div class='kb_block' id='{$this->instance_id}'>";
            