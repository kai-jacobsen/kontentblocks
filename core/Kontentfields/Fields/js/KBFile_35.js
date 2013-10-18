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
							library:    media.query( _.defaults({type: 'document'}), options.library ),
							multiple:   'false',
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
						KBFile.unload();
				});
				
				// Important. Save the original function which handles 'insert into post' for use with TinyMce
				// We have to restore this later, else the native media uploader / insert into post will stop to work
				window.original_send_to_editor = window.send_to_editor;
				window.send_to_editor = null;
                                
                                // Setup Inputs
                                			
				
				// this gets fired when you hit "insert..."
				window.send_to_editor = function(html) {
                                        
					console.log(attach);
                                        $(input).val(attach.id);
					$(activeField).find('.description').append(attach.url);
					

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