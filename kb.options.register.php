<?php 
/* kb_register_page */

function kb_register_page() {
	global $Kontentblocks;
	
	if (  ! empty( $_POST ) AND isset( $_POST['action'] ) )
	{
		if(  'update' === $_POST['action'] ) {
			if ( ! check_admin_referer( 'kb_register','kb_register_nonce' ) )
				return;

			if ( isset( $_POST['kb_post_types']) && is_array($_POST['kb_post_types'] ) ) {
				foreach( $_POST['kb_post_types'] as $k => $v ) {
					$kb_post_types[] = $v;
				};
			};

			if ( isset($_POST['kb_page_templates']) && is_array($_POST['kb_page_templates']) ) {
				foreach($_POST['kb_page_templates'] as $k => $v ){
					$kb_page_templates[] = $v;
				};
			};

			if ( 
				! isset( $kb_post_types ) 
				OR ! is_array( $kb_post_types ) 
			) 
				$kb_post_types = array();
			if ( 
				! isset( $kb_page_templates ) 
				OR ! is_array( $kb_page_templates ) 
			) 
				$kb_page_templates = array();			

            $new = array(
				'post_types' => $kb_post_types,
				'page_templates' => $kb_page_templates
			);

			update_option('kontentblocks', $new);
		}
	};
?>
    
    	<form action="" method="post">
            
        <?php wp_nonce_field('kb_register','kb_register_nonce'); ?>
            
   		<?php $options = $Kontentblocks->content_types;
			
			  $args=array(
                            'public'   => true
			  ); 
			
		$output = 'objects'; // names or objects, note names is the default
		$operator = 'and'; // 'and' or 'or'
		$post_types= get_post_types($args,$output,$operator); 
		?>
        
        <div class="kb_options_wrapper">
     	
            <div class="kb_options_header">
                <div  class="icon32"><img src="<?php echo KB_PLUGIN_URL.'css/logo32.png'; ?>" /></div>
                <h2><?php _e('Kontentblocks Block Settings', 'kontentblocks'); ?></h2>
            </div> <!--end options header -->

                <div id="block-tabs">
    
                    <ul class="block-nav tabs">
                        <li><a href="#setup">Setup</a></li>   	
                    </ul>
	
                    <div class="tabs-content">
                        <div id="setup">
    
                            <h3><?php _e('Post Types','kontentblocks'); ?></h3>
                            
                                <?php foreach ($post_types  as $post_type ) {
                                if ($post_type->name == 'attachment') { continue; };
                                if (is_array($options['post_types'])) {
                                }?>
            
			            <div class="kb_checkbox_option">
                                        <label class="checkboxlabel" for="<?php echo $post_type->name ?>"><?php echo $post_type->labels->name; ?></label>  
					<input type="checkbox" id="<?php echo $post_type->name ?>" name="kb_post_types[]" <?php checked( in_array( $post_type->name, is_array( $options['post_types'] ) ? $options['post_types'] : array() ), 1 ); ?> value="<?php echo $post_type->name; ?>">
                                    </div>
            
				<?php  }  ?>
    
                                    <div class="form-field form-required page_templates">
                                    <h3><?php _e('Page Templates','kontentblocks'); ?></h3>
                                
                                    <?php 
                                    $page_templates = get_page_templates();
                                    $page_templates['Default (page.php)'] = 'default';
                                    if (empty($page_templates)) { ?>
                                    <p><?php _e('No page templates.','kontentblocks'); ?></p>
                       		<?php } else { 
					foreach ($page_templates as $template => $filename) { 
						?>
						<div class="kb_checkbox_option">
                                                    <label class="checkboxlabel" for="<?php echo $template ?>"><?php echo $template ?></label>  
                                                    <input type="checkbox" id="<?php echo $template ?>" name="kb_page_templates[]" <?php checked( in_array( $filename, is_array( $options['page_templates'] ) ? $options['page_templates'] : array() ), 1 ); ?> value="<?php echo $filename; ?>">
                                                </div><!--end checkbox -->
				<?php }} ?>
                       
                                    </div><!--end formfield -->
                        </div><!--end #setup -->
		</div>
            </div> 
        </div>   
    <input type="hidden" name="action" value="update" />
    <input name="Submit" type="submit" class="button-primary" value="<?php esc_attr_e('Save Changes', 'kontentblocks'); ?>" />
    </form>

<?php
}