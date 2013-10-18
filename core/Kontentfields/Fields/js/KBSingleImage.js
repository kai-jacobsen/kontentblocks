var KBSingleImage, KBInputs ={}; 

(function($){
	
        
	
        KBSingleImage = 
	{
            
	
		init: function() 
			{
				$('body').on('click','.kb-add-single-image', function(e) {
                                    caller = $(this).parent().parent();
                                    KBSingleImage.setupInputs();
                                    KBSingleImage.start();
                                    e.preventDefault();
				});
                                
                                $('body').on('click','.kb-remove-single-image', function(e) {
                                    caller = $(this).parent().parent();
                                    KBSingleImage.setupInputs();
                                    KBSingleImage.remove();
                                    e.preventDefault();
				});
                                        
				
				// Thickbox triggers 'unload' whenever the window gets closed
				// we use it to restore the original function

				// #post_id is a hidden field
				KBInputs.post_id = $('#post_ID').val();
			},
                        
                setupInputs: function() {
                    
                                // Setup Inputs
				KBInputs.image_frame = $(caller).find('.kb-field-image-frame');
                                KBInputs.save_field  = $(caller).find('input[type=hidden]');
                                
                                KBInputs.remove      = $(caller).find('.kb-remove-single-image');
                                KBInputs.add         = $(caller).find('.kb-add-single-image');
                                KBInputs.key         = $(KBInputs.save_field).attr('data-key');
                        },
			
		start: function()
			{
				
                                
				$(window).bind('tb_unload', function() {
						KBSingleImage.unload();
				});
				// Important. Save the original function which handles 'insert into post' for use with TinyMce
				// We have to restore this later, else the native media uploader / insert into post will stop to work
				window.original_send_to_editor = window.send_to_editor;
				
                                
                                // Setup Inputs
				KBInputs.image_frame = $(caller).find('.kb-field-image-frame');
                                KBInputs.save_field  = $(caller).find('input[type=hidden]');
                                
                                KBInputs.remove      = $(caller).find('.kb-remove-single-image');
                                KBInputs.add         = $(caller).find('.kb-add-single-image');
                                KBInputs.key         = $(KBInputs.save_field).attr('data-key');
                                
				// open thickbox
				tb_show('', 'media-upload.php?post_id='+KBInputs.post_id+'&type=image&tab=type&kb_change_iu=true&TB_iframe=true');
				
				
				// this gets fired when you hit "insert..."
				window.send_to_editor = function(html) {
		
					// kb_image_send_to_editor will make all properties available as single vars
					// refer to kb_helper.php for more informations
					
					// 
                                        
						KB.ajax(
							{
								action: 'kb_single_image_get_and_set', 
								attachment_id: kb_attachment_id,
								blockid: activeBlock,
								post_id : $('#post_ID').val(),
								key : KBInputs.key
							}, 
								function(response){
									if (response != 0) {
									KBInputs.save_field.val(kb_attachment_id);
									KBInputs.image_frame.fadeTo(500,0, function() {
											KBInputs.image_frame.empty();
											KBInputs.image_frame.append(response);
											KBInputs.image_frame.fadeTo(500,1);
											KBInputs.remove.fadeTo(350,1);
											KBInputs.add.text('Change Image');
											KB.notice('<p>Image added</p>');
										})
									}
							})
                                        
					
					// trigger 'unload' and close thickbox 
					KBSingleImage.unload();
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
                            
                                KB.ajax(
                                {
                                    action: 'kb_single_image_remove',
                                    blockid: activeBlock,
                                    key: KBInputs.key,
                                    post_id: $('#post_ID').val()
                                    
                                }, function(res) {
                                    if(res == 1) {
                                            KBInputs.save_field.val('');
                                            KBInputs.image_frame.find('img').fadeTo(350,0.4, function(){
                                           
                                            $(this).remove();
                                            KBInputs.remove.fadeTo(300,0);
                                            KBInputs.add.text('add Image');
                                                })
                                            KB.notice('<p>Image removed</p>');
                                            } else {
                                            KB.notice('<p>There was a problem</p>');
                                            }
                                });
                                
                                
                                
			}
				
				
				
					
				}
	
	
	
		$(document).ready( KBSingleImage.init );
})(jQuery);