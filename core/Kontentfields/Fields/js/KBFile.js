var KBFile, input;

(function($){
	
	KBFile = 
	{
	
		init: function() 
			{
				$('body').on('click','a.kb-add-file', function(e) {
					
					input = $(this).prev();
					type = $(this).attr('data-type');
					e.preventDefault();
					KBFile.start(type);
				});
                                
				// #post_id is a hidden field
				
                                
                                
			},
			
		start: function(type)
			{
				
				$(window).bind('tb_unload', function() {
						KBFile.unload();
				});
				// post_id = $('#post_ID').val();
				// Important. Save the original function which handles 'insert into post' for use with TinyMce
				// We have to restore this later, else the native media uploader / insert into post will stop to work
				window.original_send_to_editor = window.send_to_editor;
				post_id = $('#post_ID').val();
				// open thickbox
				tb_show('', 'media-upload.php?post_id='+post_id+'&type='+type+'&tab=type&kb_change_iu=true&amp;TB_iframe=true');
				
				
				// this gets fired when you hit "insert..."
				window.send_to_editor = function(html) {
		
					// kb_file_media_send_to_editor filter will make all properties available as single vars
                                        $(input).val(kb_file_send_id);
					

					// trigger 'unload' and close thickbox 
					KBFile.unload();
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
	
	
	
		$(document).ready( KBFile.init );
})(jQuery);