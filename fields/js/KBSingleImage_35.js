var KBSingleImage, KBInputs ={}, attach, backup, freak; 

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
			
			    // Backup original
			    MediaFrameBackup = wp.media.view.MediaFrame.Post.prototype.createStates;
		    
			    // new function
			    wp.media.view.MediaFrame.Post.prototype.createStates = function(){
					var options = this.options;
					media = wp.media;
					l10n = wp.media.view.l10n;
					l10n.insertIntoPost = 'Einfügen';

					// Add the default state.
					this.states.add([
						// Main states.
						new media.controller.Library({
							id:         'insert',
							title:      l10n.insertMediaTitle,
							priority:   20,
							toolbar:    'main-insert',
							filterable: 'all',
							library:    media.query( _.defaults({type: 'image'}), options.library ),
							multiple:   false,
							editable:   true,

							// If the user isn't allowed to edit fields,
							// can they still edit it locally?
							allowLocalEdits: true,

							// Show the attachment display settings.
							displaySettings: false,
							// Update user settings when users adjust the
							// attachment display settings.
							displayUserSettings: true
						})
					]);
				};
				
				// open modal
				if ( typeof wp !== 'undefined' && wp.media && wp.media.editor )
				    wp.media.editor.open( activeBlock );
				
				// backup of original send function
				backup = wp.media.editor.send.attachment;
				
				// new send function, just stores the attachment object to a variable
				wp.media.editor.send.attachment = function( a, b) {
				   attach = b;
				};
				
			    
				 
				
				$(window).bind('tb_unload', function() {
						KBSingleImage.unload();
				});
				
				// Important. Save the original function which handles 'insert into post' for use with TinyMce
				// We have to restore this later, else the native media uploader / insert into post will stop to work
				window.original_send_to_editor = window.send_to_editor;
				window.send_to_editor = null;
                                
                                // Setup Inputs
				KBInputs.image_frame = $(caller).find('.kb-field-image-frame');
                                KBInputs.save_field  = $(caller).find('input[type=hidden]');
                                
                                KBInputs.remove      = $(caller).find('.kb-remove-single-image');
                                KBInputs.add         = $(caller).find('.kb-add-single-image');
                                KBInputs.key         = $(KBInputs.save_field).attr('data-key');
                                			
				
				
				// this gets fired when you hit "insert..."
				window.send_to_editor = function(html) {
				   
                                        
				    KB.ajax(
					    {
						    action: 'kb_single_image_get_and_set', 
						    attachment_id: attach.id,
						    blockid: activeBlock,
						    post_id : $('#post_ID').val(),
						    key : KBInputs.key
					    }, 
						    function(response){
							console.log(response);
							    if (response.success === true) {
								
							    KBInputs.save_field.val(attach.id);
							    KBInputs.image_frame.fadeTo(500,0, function() {
									    KBInputs.image_frame.empty();
									    KBInputs.image_frame.append(response.data);
									    KBInputs.image_frame.fadeTo(500,1);
									    KBInputs.remove.fadeTo(350,1);
									    KBInputs.add.text('Change Image');
									    KB.notice('<p>Image added</p>');
								    });
							    }
					    });
                                        
					
					// trigger 'unload' and close thickbox 
					KBSingleImage.unload();
					tb_remove();
				};	
			},
			
		unload : function()
			{
				// restore the original function 
				window.send_to_editor = window.original_send_to_editor;
				wp.media.editor.send.attachment = backup;
				wp.media.view.MediaFrame.Post.prototype.createStates = MediaFrameBackup;
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