var KBImage, post_id;

(function($){
	
	KBImage = 
	{
	
		init: function() 
			{
				$('.kb-add-image').live('click', function(e) {
					KBImage.start();
					e.preventDefault();
				});
				
				// Thickbox triggers 'unload' whenever the window gets closed
				// we use it to restore the original function

				
				// #post_id is a hidden field
				post_id = $('#post_id').val();
			},
			
		start: function()
			{
				
				$(window).bind('tb_unload', function() {
						KBImage.unload();
				});
				// Important. Save the original function which handles 'insert into post' for use with TinyMce
				// We have to restore this later, else the native media uploader / insert into post will stop to work
				window.original_send_to_editor = window.send_to_editor;
				
				var requested_size = $('#'+activeBlock+' .kb-add-image').attr('data-size');
				if (requested_size == '')
					requested_size = 'thumbnail';
					
				var image_frame = $('#'+activeBlock+' .kb_image_frame');
				var hidden_id = $('#'+activeBlock+' .kb_attachment_id');
				// open thickbox
				tb_show('', 'media-upload.php?post_id='+post_id+'&type=image&tab=type&kb_change_iu=true&amp;TB_iframe=true');
				
				
				// this gets fired when you hit "insert..."
				window.send_to_editor = function(html) {
		
					// kb_image_send_to_editor will make all properties available as single vars
					// refer to kb_helper.php for more informations
					
					// 
					$.post(
						ajaxurl,
						{
							action: 'kb_get_image',
							kb_att_id: kb_attachment_id,
							kb_image_size : requested_size
						},
							function(response) {
								$(hidden_id).val(kb_attachment_id);
								
								$(image_frame).fadeTo(500,0, function() {
									$(image_frame).empty();
									$(image_frame).append(response)
										$(image_frame).fadeTo(500,1);
										
										
								})
						
					
				});
					// trigger 'unload' and close thickbox 
					KBImage.unload();
					tb_remove();
				};	
			},
			
		unload : function()
			{
				// restore the original function 
				window.send_to_editor = window.original_send_to_editor;
			},
			
		remove : function() 
			{
				
			}
				
				
				
					
				}
	
	
	
		$(document).ready( KBImage.init );
})(jQuery);