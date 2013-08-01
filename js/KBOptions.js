var form, button, KBArea, Area = new Object, post_types = [];

(function($){
	
	KBArea = {
		
			init: function() {
				
				if ( $('.area_edit_tabs') )
					{
						$('.area_edit_tabs').tabs();
					}
				
				button = $('#add-area');
				form   = $('#add-area_form');	
				
				/*$(button).click(function(e) {
					e.preventDefault();
					KB.validateForm(form);
					})*/
				
			},
			
			add_area: function() {
			  

				if ( !validateForm( form ) )
				return false;
			  
			  // get post types
			  post_types = [];
			  $('.post-types :checked').each(function(i) {
       			post_types[i] = $(this).val();
				});
				
			  // page templates
			  page_templates = [];
			  $('.page_templates :checked').each(function(i) {
       			page_templates[i] = $(this).val();
				});
			   
			   Area.post_types = post_types;
			   Area.page_templates = page_templates;
			   Area.area_id = $('#area_id').val();
			   Area.area_name = $('#area_name').val();			   
				
			   $.post(
						ajaxurl,
						{
							action: 'kb_add_new_area',
							data: Area
						}, function(res) {
							$('#the-list').append(res);
						}
					 )
			}
		
	};
			
			$(document).ready( KBArea.init );
})(jQuery);


jQuery(document).ready( function() { 
	if (jQuery('#block-tabs').length ) {
	
	jQuery('#block-tabs').tabs({ fx: { opacity: 'toggle' } });
	}
	
});

