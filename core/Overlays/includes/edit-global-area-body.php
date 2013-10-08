<?php

use Kontentblocks\Utils\AreaDirectory,
    Kontentblocks\Helper,
    Kontentblocks\Admin\Area;
?>
<body class="wp-admin no-js <?php echo apply_filters( 'admin_body_class', '' ) . " $admin_body_class"; ?>">
    <div id="root-container" class="nano">	
        <div class="content">
            <script type="text/javascript">document.body.className = document.body.className.replace('no-js', 'js');</script>
            <?php
            	wp_enqueue_script('dynamic_areas', KB_PLUGIN_URL . '/js/dynamic_areas.js');

            //render hidden reference Editor instance
            Helper\getHiddenEditor();

            // get areas data
//    $areas           = $Kontentblocks->get_areas();
//    $area            = $areas[ $area_id ];
            $areaArgs = AreaDirectory::getInstance()->getArea( $this->id );
//    $d_areas         = get_option( 'kb_dynamic_areas' );
//    $dareas_settings = get_option( 'kb_dynamic_areas_settings' );
//
//    $blocks = (!empty( $d_areas[ $this->id ] )) ? $d_areas[ $this->id ] : null;
//
//    if ( !empty( $blocks ) )
//        $blocks = $Kontentblocks->_setup_blocks( $blocks );

            echo "<form action='admin-ajax.php?action=editGlobalArea&daction=update&area={$areaArgs[ 'id' ]}&ext=1&nonce={$this->nonce}' method='post'>";
            echo"	<div class='kb_page_wrap kb_tb_dynamic_area kb_thickbox '>
					<div class='area-holder'>";


            wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );
            echo Helper\getbaseIdField( $this->dataContainer->getAllModules() );

            // add a hidden field to the meta box, javascript will use this
            echo '<input type="hidden" id="post_ID" value="-1" />';
            echo '<input type="hidden" id="area_context" value="' .$this->context .'" />';
            echo '<div id="kontentblocks_stage">';
            echo "<div class='dynamic_area_list'>";

            $area = new Area( $areaArgs, $this->dataContainer );
            $area->header();
            $area->render();
            echo "</div>
					</div>
					</div>
						<input class='primary-button' type='submit' value='Änderungen speichern' >
						</form></div></div>";
            