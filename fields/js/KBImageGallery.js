var KBImageGallery, KBInputs ={};  

(function($){

	var attach=[], attachment=[], backup, MediaFrameBackup;
	
       var KBImageGallery = 
	{
		
		init: function() 
			{
				
				
				$('body').on('click','.kb-add-gallery-images', function(e) {
                                    KBImageGallery.start();
                                    e.preventDefault();
				});
			    
				$('body').on('modal-close', function(e){
				   KBImageGallery.unload();
				});
			    
				$('body').on('click','.kb-field-gallery-image-delete', function(){
				   KBImageGallery.remove($(this));
				});
				
				$('body').on('click','.kb-field-gallery-image-info', function(){
				   KBImageGallery.getInfo($(this));
				});
				
				$('body').on('click', '.kb-field-gallery-update', function()
				{
				    KBImageGallery.update($(this));
				});
			    
				$('.kb-field-gallery-wrapper').sortable();
			},
                        
                setupInputs: function() {
                    
                                // Setup Inputs
				KBImageGallery.list		= $(KBImageGallery.caller).find('.kb-field-gallery-wrapper');
                                KBImageGallery.post_id		= $('#post_ID').val();
                                KBImageGallery.add		= $(KBImageGallery.caller).find('.kb-add-gallery-images');
                                KBImageGallery.key		= $(KBInputs.save_field).attr('data-key');
				
				
                        },
			
		start: function()
			{
			    
			    
			    
			    KBImageGallery.caller = activeField;
			    
			    KBImageGallery.setupInputs();
			
			    // Backup original
			    MediaFrameBackup = wp.media.view.MediaFrame.Post.prototype.createStates;
		    
			    // new function
			    wp.media.view.MediaFrame.Post.prototype.createStates = function(){
					var options = this.options;
					media = wp.media;
					l10n = wp.media.view.l10n;
					l10n.insertIntoPost = 'Einfügen_';

					// Add the default state.
					this.states.add([
						// Main states.
						new media.controller.Library({
							id:         'insert',
							title:      l10n.insertMediaTitle,
							priority:   20,
							toolbar:    'main-insert',
							filterable: 'image',
							library:    media.query( _.defaults({type: 'image'}), options.library ),
							multiple:   'add',
							editable:   false,

							// If the user isn't allowed to edit fields,
							// can they still edit it locally?
							allowLocalEdits: false,

							// Show the attachment display settings.
							displaySettings: false,
							// Update user settings when users adjust the
							// attachment display settings.
							displayUserSettings: false
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
				   attach.push(b);
				};
				
				// Important. Save the original function which handles 'insert into post' for use with TinyMce
				// We have to restore this later, else the native media uploader / insert into post will stop to work
				window.original_send_to_editor = window.send_to_editor;
				
				
                                
                                // Setup Inputs
				KBInputs.image_frame = $(KBImageGallery.caller).find('kb-field-gallery-wrapper');
                                KBInputs.save_field  = $(KBImageGallery.caller).find('.keyref');
				

				
                                KBInputs.key         = $(KBInputs.save_field).attr('data-key');
				
				data = [];
				data.attachments = attach;
				data.post_id = $('#post_ID').val();
				data.blockid = activeBlock;
				data.key = KBInputs.key;
				// this gets fired when you hit "insert..."
				window.send_to_editor = function(html) {
				    
				     KB.ajax(
					    {
						    action: 'kb_gallery_get_images',
						    attachments: data.attachments,
						    key: data.key,
						    blockid: data.blockid
					    }, 
						    function(response){
							    if (response.status == 'success') {
								
								$.each(response.attachments, function(i, el){
								    KBImageGallery.list.append(el);
								});
								
							    }
					    })
                                        
					
					// trigger 'unload' and close thickbox 
					KBImageGallery.unload();
				};	
			    
		
			    
			},
			
		unload : function()
			{
			    
				// restore the original function 
				window.send_to_editor = window.original_send_to_editor;
				wp.media.editor.send.attachment = backup;
				wp.media.view.MediaFrame.Post.prototype.createStates = MediaFrameBackup;
			},
		
                
		remove : function(el) 
			{       
                            
                           parent = $(el).closest('li');
			   
			   if (!parent.hasClass('todelete'))
			       {
				   $(parent).addClass('todelete').find('input').val('');
			       }
			   else
			       {
				   $(parent).removeClass('todelete').find('input').val($(parent).attr('data-id'));
			       }
                            
			}	
		};
			    
		
	    

		$(document).ready( function(){
		 KBImageGallery.init();
		 });
})(jQuery);