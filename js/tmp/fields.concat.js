var KBDate;

(function($) {

    KBDate =
            {
                init: function()
                {

                    $('.datepicker').each(function() {
                        $(this).datepicker({
                            altField: $(this).closest('div').find('.altfield'),
                            altFormat: "yy-mm-dd",
                            dateFormat: "DD, MM d, yy",
                            regional: 'de'
                        });
                    });
                    if ($.datepicker && $.datepicker.regional) {
                        console.log($.datepicker.regional);
                        $.datepicker.setDefaults($.datepicker.regional[ "de" ]);
                    }
                }
            };



    $(document).ready(KBDate.init);
})(jQuery);
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
var KBLink, input;

(function($){
	
	var inputs = {}, restore_htmlUpdate, restore_isMce ;
	
	KBLink = 
	{
	
		init : function () 
		{
			$('body').on('click','.kb-add-link', function(e) {
					
					e.preventDefault();
                                        input = $(this).prev().attr('id');
                                        KBLink.start(input);
                                        
				});
			
                        

			
		},
		
		start : function (input) 
		{
			$('#wp-link').find('.link-target').hide().prev('div').hide();
		    
			// set activeEditor, in this caseour textfield, dialog won't open if not set
			wpActiveEditor = input;
			//open the dialog
			wpLink.open();
			
			
			// store the orignal function
			restore_htmlUpdate = wpLink.htmlUpdate;
			restore_isMce = wpLink.isMCE;
			
			// it's not tinymce, ovverride the original
			wpLink.isMCE = function () { return false };
			
			
			// magic happens here,override the original function
			wpLink.htmlUpdate =  function() {
			var attrs, html, start, end, cursor,
				
			textarea = wpLink.textarea, result;

			if ( ! textarea )
				return;
				
			// get contents of dialog
			attrs = wpLink.getAttrs();
			
			// If there's no href, return.
			if ( ! attrs.href || attrs.href == 'http://' )
				return;
							
			// Clear textarea
			jQuery(textarea).empty();
			
			//Append the Url to the textarea
			textarea.value = attrs.href;
			
			//restore the original function
			

			// close dialog and put the cursor inside the textarea
			
			
			wpLink.close();
			KBLink.close();
			textarea.focus();
			
		}

	
		},
		
		remove : function() {
			
		    $('#'+activeBlock).find('input').each ( function(i) {
					$(this).val('');
				});
		},
		
		close : function() {
			
			// restore the original functions to wpLink
			wpLink.isMCE = restore_isMce;
			wpLink.htmlUpdate = restore_htmlUpdate;

			}
	
	}
		
	
	$(document).ready( KBLink.init );
})(jQuery);
var KBLinkAdv;

(function($) {

    var inputs = {}, restore_htmlUpdate, restore_isMce;

    KBLinkAdv =
            {
                href: null,
                title: null,
                target: false,
                init: function()
                {
                    $('body').on('click', '.kb-add-link-adv', function(e) {
                        e.preventDefault();
                        KBLinkAdv.href = $('.key-href', $(activeField));
                        KBLinkAdv.title = $('.key-title', $(activeField));
                        KBLinkAdv.start();
                    });
                },
                start: function()
                {
                    $('#wp-link').find('.link-target').hide();

                    // set activeEditor, in this caseour textfield, dialog won't open if not set
                    wpActiveEditor = KBLinkAdv.href.attr('id');
                    //open the dialog
                    wpLink.open();

                    KBLinkAdv.title.empty();

                    // store the orignal function
                    restore_htmlUpdate = wpLink.htmlUpdate;
                    restore_isMce = wpLink.isMCE;

                    // it's not tinymce, ovverride the original
                    wpLink.isMCE = function() {
                        return false
                    };


                    // magic happens here,override the original function
                    wpLink.htmlUpdate = function() {
                        var attrs, html, start, end, cursor,
                                textarea = wpLink.textarea, result;

                        if (!textarea)
                            return;

                        // get contents of dialog
                        attrs = wpLink.getAttrs();
                        // If there's no href, return.
                        if (!attrs.href || attrs.href == 'http://')
                            return;

                        // Clear textarea
                        jQuery(textarea).empty();

                        //Append the Url to the textarea
                        textarea.value = attrs.href;
                        KBLinkAdv.title.val(attrs.title);
                        //restore the original function


                        // close dialog and put the cursor inside the textarea


                        wpLink.close();
                        KBLinkAdv.close();
                        textarea.focus();

                    }


                },
                remove: function() {

                    $('#' + activeBlock).find('input').each(function(i) {
                        $(this).val('');
                    });
                },
                close: function() {

                    // restore the original functions to wpLink
                    wpLink.isMCE = restore_isMce;
                    wpLink.htmlUpdate = restore_htmlUpdate;

                }

            }


    $(document).ready(KBLinkAdv.init);
})(jQuery);
var KBPageContent;

(function($){

    KBPageContent = {
        
        init: function() {
            
            // Binds
            $('#kontentblocks_stage').on('change', '.kb-chose-pt', function(e) {
                
                e.preventDefault();
                $value = $(this).val();
                $container = $(this).parent().find('.kb-chose-pid');
                caller = $(this).parent();
                
                $.post(
                    ajaxurl,
                    {
                        action: 'get_post_list',
                        post_type: $value
                    }, function(res){
                        $($container).empty().append(res);
                        $($container).trigger("liszt:updated");
                        
                        excerptfor = $($container).val();
                        KBPageContent.get_excerpt(excerptfor, caller);
                        
                    }
                );
                
            })
            
            $('#kontentblocks_stage').on('change', '.kb-chose-pid', function(e) {
                excerptfor = $(this).val();
                caller = $(this).parent();
                KBPageContent.get_excerpt(excerptfor,caller );
                
            });
        },
        
        get_excerpt: function(id, caller) {
                $.post(
                    ajaxurl,
                    {
                        action: 'get_post_excerpt',
                        post_id: id
                    }, function(res){
                        
                        if (res == '') {
                            res = '<p>No post content available for preview';
                        }
                        
                       $(caller).find('.page-content-preview').fadeTo(350,0, function() {
                          $(this).empty().append(res); 
                          $(this).fadeTo(350,1);
                       })
                       
                        
                    }
                );            
        }
        
    }

    $(document).ready( KBPageContent.init );
})(jQuery);
var KBQuicktags, input;

(function($){
	
	KBQuicktags = 
	{
	
	init: function() 
	    {
		
		
		/*$(document).on('hover', '.quicktags', function(e){
			input = $(this).find('textarea').attr('id');
			
		});*/
	    
		
		KBQuicktags.add();
		
		$(document).bind( 'kb_block_added', function(){
		    KBQuicktags.add();
		});
	    },
	
	add: function()
	    {
		
		$('.quicktags').each(function() {
		    id = $(this).find('textarea').attr('id');

		    settings = {
		      id : id,
		      buttons: 'strong,em,link' // Comma separated list of the names of the default buttons to show. Optional.
		    };
		
		
		    $check = $(this).find('.quicktags-toolbar').length;
		    
		    // don't add quicktags multiple times on the same object
		    if (!$check)
			{
			    var qt = new QTags(settings);
			    QTags._buttonsInit();		    
			}


		    
		});
	    }
	
			
		
				
				
					
	}
	
	
	
		$(document).ready( KBQuicktags.init );
})(jQuery);
var KBRadioImages;

(function($){
	
	KBRadioImages = 
	{
	
		init: function() 
			{
			    
			    $('body').on('click', '.kb_radio_image', function(){
				$(this).prev().prop('checked', true);
				console.log('click');
				
				
				$(this).parent().parent().find('.kb_radio_image').each( function(){
				    $(this).removeClass('kb_radio_selected');
				})
				$(this).addClass('kb_radio_selected');
			    })
			}		
	}
	
	
	
		$(document).ready( KBRadioImages.init );
})(jQuery);
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
/* http://keith-wood.name/timeEntry.html
   Time entry for jQuery v1.5.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) June 2007.
   Licensed under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license.
   Please attribute the author if you use it. */
(function($){function TimeEntry(){this._disabledInputs=[];this.regional=[];this.regional['']={show24Hours:false,separator:':',ampmPrefix:'',ampmNames:['AM','PM'],spinnerTexts:['Now','Previous field','Next field','Increment','Decrement']};this._defaults={appendText:'',showSeconds:false,timeSteps:[1,1,1],initialField:0,noSeparatorEntry:false,useMouseWheel:true,defaultTime:null,minTime:null,maxTime:null,spinnerImage:'spinnerDefault.png',spinnerSize:[20,20,8],spinnerBigImage:'',spinnerBigSize:[40,40,16],spinnerIncDecOnly:false,spinnerRepeat:[500,250],beforeShow:null,beforeSetTime:null};$.extend(this._defaults,this.regional[''])}$.extend(TimeEntry.prototype,{markerClassName:'hasTimeEntry',propertyName:'timeEntry',_appendClass:'timeEntry_append',_controlClass:'timeEntry_control',_expandClass:'timeEntry_expand',setDefaults:function(a){$.extend(this._defaults,a||{});return this},_attachPlugin:function(b,c){var d=$(b);if(d.hasClass(this.markerClassName)){return}var e={options:$.extend({},this._defaults,c),input:d,_field:0,_selectedHour:0,_selectedMinute:0,_selectedSecond:0};d.data(this.propertyName,e).addClass(this.markerClassName).bind('focus.'+this.propertyName,this._doFocus).bind('blur.'+this.propertyName,this._doBlur).bind('click.'+this.propertyName,this._doClick).bind('keydown.'+this.propertyName,this._doKeyDown).bind('keypress.'+this.propertyName,this._doKeyPress).bind('paste.'+this.propertyName,function(a){setTimeout(function(){n._parseTime(e)},1)});this._optionPlugin(b,c)},_optionPlugin:function(a,b,c){a=$(a);var d=a.data(this.propertyName);if(!b||(typeof b=='string'&&c==null)){var e=b;b=(d||{}).options;return(b&&e?b[e]:b)}if(!a.hasClass(this.markerClassName)){return}b=b||{};if(typeof b=='string'){var e=b;b={};b[e]=c}var f=this._extractTime(d);$.extend(d.options,b);d._field=0;if(f){this._setTime(d,new Date(0,0,0,f[0],f[1],f[2]))}a.next('span.'+this._appendClass).remove();a.parent().find('span.'+this._controlClass).remove();if($.fn.mousewheel){a.unmousewheel()}var g=(!d.options.spinnerImage?null:$('<span class="'+this._controlClass+'" style="display: inline-block; '+'background: url(\''+d.options.spinnerImage+'\') 0 0 no-repeat; width: '+d.options.spinnerSize[0]+'px; height: '+d.options.spinnerSize[1]+'px;"></span>'));a.after(d.options.appendText?'<span class="'+this._appendClass+'">'+d.options.appendText+'</span>':'').after(g||'');if(d.options.useMouseWheel&&$.fn.mousewheel){a.mousewheel(this._doMouseWheel)}if(g){g.mousedown(this._handleSpinner).mouseup(this._endSpinner).mouseover(this._expandSpinner).mouseout(this._endSpinner).mousemove(this._describeSpinner)}},_enablePlugin:function(a){this._enableDisable(a,false)},_disablePlugin:function(a){this._enableDisable(a,true)},_enableDisable:function(b,c){var d=$.data(b,this.propertyName);if(!d){return}b.disabled=c;if(b.nextSibling&&b.nextSibling.nodeName.toLowerCase()=='span'){n._changeSpinner(d,b.nextSibling,(c?5:-1))}n._disabledInputs=$.map(n._disabledInputs,function(a){return(a==b?null:a)});if(c){n._disabledInputs.push(b)}},_isDisabledPlugin:function(a){return $.inArray(a,this._disabledInputs)>-1},_destroyPlugin:function(b){b=$(b);if(!b.hasClass(this.markerClassName)){return}b.removeClass(this.markerClassName).removeData(this.propertyName).unbind('.'+this.propertyName);if($.fn.mousewheel){b.unmousewheel()}this._disabledInputs=$.map(this._disabledInputs,function(a){return(a==b[0]?null:a)});b.siblings('.'+this._appendClass+',.'+this._controlClass).remove()},_setTimePlugin:function(a,b){var c=$.data(a,this.propertyName);if(c){if(b===null||b===''){c.input.val('')}else{this._setTime(c,b?(typeof b=='object'?new Date(b.getTime()):b):null)}}},_getTimePlugin:function(a){var b=$.data(a,this.propertyName);var c=(b?this._extractTime(b):null);return(!c?null:new Date(0,0,0,c[0],c[1],c[2]))},_getOffsetPlugin:function(a){var b=$.data(a,this.propertyName);var c=(b?this._extractTime(b):null);return(!c?0:(c[0]*3600+c[1]*60+c[2])*1000)},_doFocus:function(a){var b=(a.nodeName&&a.nodeName.toLowerCase()=='input'?a:this);if(n._lastInput==b||n._isDisabledPlugin(b)){n._focussed=false;return}var c=$.data(b,n.propertyName);n._focussed=true;n._lastInput=b;n._blurredInput=null;$.extend(c.options,($.isFunction(c.options.beforeShow)?c.options.beforeShow.apply(b,[b]):{}));n._parseTime(c);setTimeout(function(){n._showField(c)},10)},_doBlur:function(a){n._blurredInput=n._lastInput;n._lastInput=null},_doClick:function(b){var c=b.target;var d=$.data(c,n.propertyName);if(!n._focussed){var e=d.options.separator.length+2;d._field=0;if(c.selectionStart!=null){for(var f=0;f<=Math.max(1,d._secondField,d._ampmField);f++){var g=(f!=d._ampmField?(f*e)+2:(d._ampmField*e)+d.options.ampmPrefix.length+d.options.ampmNames[0].length);d._field=f;if(c.selectionStart<g){break}}}else if(c.createTextRange){var h=$(b.srcElement);var i=c.createTextRange();var j=function(a){return{thin:2,medium:4,thick:6}[a]||a};var k=b.clientX+document.documentElement.scrollLeft-(h.offset().left+parseInt(j(h.css('border-left-width')),10))-i.offsetLeft;for(var f=0;f<=Math.max(1,d._secondField,d._ampmField);f++){var g=(f!=d._ampmField?(f*e)+2:(d._ampmField*e)+d.options.ampmPrefix.length+d.options.ampmNames[0].length);i.collapse();i.moveEnd('character',g);d._field=f;if(k<i.boundingWidth){break}}}}n._showField(d);n._focussed=false},_doKeyDown:function(a){if(a.keyCode>=48){return true}var b=$.data(a.target,n.propertyName);switch(a.keyCode){case 9:return(a.shiftKey?n._changeField(b,-1,true):n._changeField(b,+1,true));case 35:if(a.ctrlKey){n._setValue(b,'')}else{b._field=Math.max(1,b._secondField,b._ampmField);n._adjustField(b,0)}break;case 36:if(a.ctrlKey){n._setTime(b)}else{b._field=0;n._adjustField(b,0)}break;case 37:n._changeField(b,-1,false);break;case 38:n._adjustField(b,+1);break;case 39:n._changeField(b,+1,false);break;case 40:n._adjustField(b,-1);break;case 46:n._setValue(b,'');break;default:return true}return false},_doKeyPress:function(a){var b=String.fromCharCode(a.charCode==undefined?a.keyCode:a.charCode);if(b<' '){return true}var c=$.data(a.target,n.propertyName);n._handleKeyPress(c,b);return false},_doMouseWheel:function(a,b){if(n._isDisabledPlugin(a.target)){return}var c=$.data(a.target,n.propertyName);c.input.focus();if(!c.input.val()){n._parseTime(c)}n._adjustField(c,b);a.preventDefault()},_expandSpinner:function(b){var c=n._getSpinnerTarget(b);var d=$.data(n._getInput(c),n.propertyName);if(n._isDisabledPlugin(d.input[0])){return}if(d.options.spinnerBigImage){d._expanded=true;var e=$(c).offset();var f=null;$(c).parents().each(function(){var a=$(this);if(a.css('position')=='relative'||a.css('position')=='absolute'){f=a.offset()}return!f});$('<div class="'+n._expandClass+'" style="position: absolute; left: '+(e.left-(d.options.spinnerBigSize[0]-d.options.spinnerSize[0])/2-(f?f.left:0))+'px; top: '+(e.top-(d.options.spinnerBigSize[1]-d.options.spinnerSize[1])/2-(f?f.top:0))+'px; width: '+d.options.spinnerBigSize[0]+'px; height: '+d.options.spinnerBigSize[1]+'px; background: transparent url('+d.options.spinnerBigImage+') no-repeat 0px 0px; z-index: 10;"></div>').mousedown(n._handleSpinner).mouseup(n._endSpinner).mouseout(n._endExpand).mousemove(n._describeSpinner).insertAfter(c)}},_getInput:function(a){return $(a).siblings('.'+n.markerClassName)[0]},_describeSpinner:function(a){var b=n._getSpinnerTarget(a);var c=$.data(n._getInput(b),n.propertyName);b.title=c.options.spinnerTexts[n._getSpinnerRegion(c,a)]},_handleSpinner:function(a){var b=n._getSpinnerTarget(a);var c=n._getInput(b);if(n._isDisabledPlugin(c)){return}if(c==n._blurredInput){n._lastInput=c;n._blurredInput=null}var d=$.data(c,n.propertyName);n._doFocus(c);var e=n._getSpinnerRegion(d,a);n._changeSpinner(d,b,e);n._actionSpinner(d,e);n._timer=null;n._handlingSpinner=true;if(e>=3&&d.options.spinnerRepeat[0]){n._timer=setTimeout(function(){n._repeatSpinner(d,e)},d.options.spinnerRepeat[0]);$(b).one('mouseout',n._releaseSpinner).one('mouseup',n._releaseSpinner)}},_actionSpinner:function(a,b){if(!a.input.val()){n._parseTime(a)}switch(b){case 0:this._setTime(a);break;case 1:this._changeField(a,-1,false);break;case 2:this._changeField(a,+1,false);break;case 3:this._adjustField(a,+1);break;case 4:this._adjustField(a,-1);break}},_repeatSpinner:function(a,b){if(!n._timer){return}n._lastInput=n._blurredInput;this._actionSpinner(a,b);this._timer=setTimeout(function(){n._repeatSpinner(a,b)},a.options.spinnerRepeat[1])},_releaseSpinner:function(a){clearTimeout(n._timer);n._timer=null},_endExpand:function(a){n._timer=null;var b=n._getSpinnerTarget(a);var c=n._getInput(b);var d=$.data(c,n.propertyName);$(b).remove();d._expanded=false},_endSpinner:function(a){n._timer=null;var b=n._getSpinnerTarget(a);var c=n._getInput(b);var d=$.data(c,n.propertyName);if(!n._isDisabledPlugin(c)){n._changeSpinner(d,b,-1)}if(n._handlingSpinner){n._lastInput=n._blurredInput}if(n._lastInput&&n._handlingSpinner){n._showField(d)}n._handlingSpinner=false},_getSpinnerTarget:function(a){return a.target||a.srcElement},_getSpinnerRegion:function(a,b){var c=this._getSpinnerTarget(b);var d=$(c).offset();var e=[document.documentElement.scrollLeft||document.body.scrollLeft,document.documentElement.scrollTop||document.body.scrollTop];var f=(a.options.spinnerIncDecOnly?99:b.clientX+e[0]-d.left);var g=b.clientY+e[1]-d.top;var h=a.options[a._expanded?'spinnerBigSize':'spinnerSize'];var i=(a.options.spinnerIncDecOnly?99:h[0]-1-f);var j=h[1]-1-g;if(h[2]>0&&Math.abs(f-i)<=h[2]&&Math.abs(g-j)<=h[2]){return 0}var k=Math.min(f,g,i,j);return(k==f?1:(k==i?2:(k==g?3:4)))},_changeSpinner:function(a,b,c){$(b).css('background-position','-'+((c+1)*a.options[a._expanded?'spinnerBigSize':'spinnerSize'][0])+'px 0px')},_parseTime:function(a){var b=this._extractTime(a);if(b){a._selectedHour=b[0];a._selectedMinute=b[1];a._selectedSecond=b[2]}else{var c=this._constrainTime(a);a._selectedHour=c[0];a._selectedMinute=c[1];a._selectedSecond=(a.options.showSeconds?c[2]:0)}a._secondField=(a.options.showSeconds?2:-1);a._ampmField=(a.options.show24Hours?-1:(a.options.showSeconds?3:2));a._lastChr='';a._field=Math.max(0,Math.min(Math.max(1,a._secondField,a._ampmField),a.options.initialField));if(a.input.val()!=''){this._showTime(a)}},_extractTime:function(a,b){b=b||a.input.val();var c=b.split(a.options.separator);if(a.options.separator==''&&b!=''){c[0]=b.substring(0,2);c[1]=b.substring(2,4);c[2]=b.substring(4,6)}if(c.length>=2){var d=!a.options.show24Hours&&(b.indexOf(a.options.ampmNames[0])>-1);var e=!a.options.show24Hours&&(b.indexOf(a.options.ampmNames[1])>-1);var f=parseInt(c[0],10);f=(isNaN(f)?0:f);f=((d||e)&&f==12?0:f)+(e?12:0);var g=parseInt(c[1],10);g=(isNaN(g)?0:g);var h=(c.length>=3?parseInt(c[2],10):0);h=(isNaN(h)||!a.options.showSeconds?0:h);return this._constrainTime(a,[f,g,h])}return null},_constrainTime:function(a,b){var c=(b!=null);if(!c){var d=this._determineTime(a.options.defaultTime,a)||new Date();b=[d.getHours(),d.getMinutes(),d.getSeconds()]}var e=false;for(var i=0;i<a.options.timeSteps.length;i++){if(e){b[i]=0}else if(a.options.timeSteps[i]>1){b[i]=Math.round(b[i]/a.options.timeSteps[i])*a.options.timeSteps[i];e=true}}return b},_showTime:function(a){var b=(this._formatNumber(a.options.show24Hours?a._selectedHour:((a._selectedHour+11)%12)+1)+a.options.separator+this._formatNumber(a._selectedMinute)+(a.options.showSeconds?a.options.separator+this._formatNumber(a._selectedSecond):'')+(a.options.show24Hours?'':a.options.ampmPrefix+a.options.ampmNames[(a._selectedHour<12?0:1)]));this._setValue(a,b);this._showField(a)},_showField:function(a){var b=a.input[0];if(a.input.is(':hidden')||n._lastInput!=b){return}var c=a.options.separator.length+2;var d=(a._field!=a._ampmField?(a._field*c):(a._ampmField*c)-a.options.separator.length+a.options.ampmPrefix.length);var e=d+(a._field!=a._ampmField?2:a.options.ampmNames[0].length);if(b.setSelectionRange){b.setSelectionRange(d,e)}else if(b.createTextRange){var f=b.createTextRange();f.moveStart('character',d);f.moveEnd('character',e-a.input.val().length);f.select()}if(!b.disabled){b.focus()}},_formatNumber:function(a){return(a<10?'0':'')+a},_setValue:function(a,b){if(b!=a.input.val()){a.input.val(b).trigger('change')}},_changeField:function(a,b,c){var d=(a.input.val()==''||a._field==(b==-1?0:Math.max(1,a._secondField,a._ampmField)));if(!d){a._field+=b}this._showField(a);a._lastChr='';return(d&&c)},_adjustField:function(a,b){if(a.input.val()==''){b=0}this._setTime(a,new Date(0,0,0,a._selectedHour+(a._field==0?b*a.options.timeSteps[0]:0)+(a._field==a._ampmField?b*12:0),a._selectedMinute+(a._field==1?b*a.options.timeSteps[1]:0),a._selectedSecond+(a._field==a._secondField?b*a.options.timeSteps[2]:0)))},_setTime:function(a,b){b=this._determineTime(b,a);var c=this._constrainTime(a,b?[b.getHours(),b.getMinutes(),b.getSeconds()]:null);b=new Date(0,0,0,c[0],c[1],c[2]);var b=this._normaliseTime(b);var d=this._normaliseTime(this._determineTime(a.options.minTime,a));var e=this._normaliseTime(this._determineTime(a.options.maxTime,a));b=(d&&b<d?d:(e&&b>e?e:b));if($.isFunction(a.options.beforeSetTime)){b=a.options.beforeSetTime.apply(a.input[0],[this._getTimePlugin(a.input[0]),b,d,e])}a._selectedHour=b.getHours();a._selectedMinute=b.getMinutes();a._selectedSecond=b.getSeconds();this._showTime(a)},_determineTime:function(i,j){var k=function(a){var b=new Date();b.setTime(b.getTime()+a*1000);return b};var l=function(a){var b=n._extractTime(j,a);var c=new Date();var d=(b?b[0]:c.getHours());var e=(b?b[1]:c.getMinutes());var f=(b?b[2]:c.getSeconds());if(!b){var g=/([+-]?[0-9]+)\s*(s|S|m|M|h|H)?/g;var h=g.exec(a);while(h){switch(h[2]||'s'){case's':case'S':f+=parseInt(h[1],10);break;case'm':case'M':e+=parseInt(h[1],10);break;case'h':case'H':d+=parseInt(h[1],10);break}h=g.exec(a)}}c=new Date(0,0,10,d,e,f,0);if(/^!/.test(a)){if(c.getDate()>10){c=new Date(0,0,10,23,59,59)}else if(c.getDate()<10){c=new Date(0,0,10,0,0,0)}}return c};return(i?(typeof i=='string'?l(i):(typeof i=='number'?k(i):i)):null)},_normaliseTime:function(a){if(!a){return null}a.setFullYear(1900);a.setMonth(0);a.setDate(0);return a},_handleKeyPress:function(a,b){if(b==a.options.separator){this._changeField(a,+1,false)}else if(b>='0'&&b<='9'){var c=parseInt(b,10);var d=parseInt(a._lastChr+b,10);var e=(a._field!=0?a._selectedHour:(a.options.show24Hours?(d<24?d:c):(d>=1&&d<=12?d:(c>0?c:a._selectedHour))%12+(a._selectedHour>=12?12:0)));var f=(a._field!=1?a._selectedMinute:(d<60?d:c));var g=(a._field!=a._secondField?a._selectedSecond:(d<60?d:c));var h=this._constrainTime(a,[e,f,g]);this._setTime(a,new Date(0,0,0,h[0],h[1],h[2]));if(a.options.noSeparatorEntry&&a._lastChr){this._changeField(a,+1,false)}else{a._lastChr=b}}else if(!a.options.show24Hours){b=b.toLowerCase();if((b==a.options.ampmNames[0].substring(0,1).toLowerCase()&&a._selectedHour>=12)||(b==a.options.ampmNames[1].substring(0,1).toLowerCase()&&a._selectedHour<12)){var i=a._field;a._field=a._ampmField;this._adjustField(a,+1);a._field=i;this._showField(a)}}}});var m=['getOffset','getTime','isDisabled'];function isNotChained(a,b){if(a=='option'&&(b.length==0||(b.length==1&&typeof b[0]=='string'))){return true}return $.inArray(a,m)>-1}$.fn.timeEntry=function(b){var c=Array.prototype.slice.call(arguments,1);if(isNotChained(b,c)){return n['_'+b+'Plugin'].apply(n,[this[0]].concat(c))}return this.each(function(){if(typeof b=='string'){if(!n['_'+b+'Plugin']){throw'Unknown command: '+b;}n['_'+b+'Plugin'].apply(n,[this].concat(c))}else{var a=($.fn.metadata?$(this).metadata():{});n._attachPlugin(this,$.extend({},a,b||{}))}})};var n=$.timeEntry=new TimeEntry()})(jQuery);
										
jQuery(document).ready(function(){
   
    jQuery('.kb-time-picker').timeEntry({show24Hours: true});
 
});										
var KBkvm;

(function($){
	
	
	KBkvm = 
	{
	
		init : function () 
		{

		    $('body').on('click', '.kvm_add_item', function(e){
			var clone = $('#' +activeBlock+' .clone-reference-empty:first');
			e.preventDefault();
			$(clone).clone().prependTo('#'+activeBlock+' .kvm-field-wrapper').removeClass('clone-reference-empty');
		    })
		    
		    $('.sortable').sortable();
		}
	}
		
	
	$(document).ready( KBkvm.init );
})(jQuery);
/*!
* Iris Color Picker Demo Script
* @author: Rachel Baker ( rachel@rachelbaker.me )
*/(function($) {
    "use strict";
    
    $(document).ready(function() {
        var link_color = $(".kb-color-picker");
        link_color.wpColorPicker({
            change: function(event, ui) {
		console.log(event.target);
               /* pickColor(link_color.wpColorPicker("color"));*/
            },
            clear: function() {
                pickColor("");
            }
        });
    });
})(jQuery);
jQuery(document).ready(function($){
    
	KBPlupload.init();
	$(document).on('kb_block_added', function(event){
        
		if( ! KBInputs.plupload_init) 
		{
		    KBPlupload.init();
					
		}
		    $('.tabs').tabs();
		    KBPlupload.plupload();
		    KBPlupload.sortable();	
	});
	
	$(document).on('click', '.plupload-image-item img', function(e){
	  
	
	    
	    $this = this; //li
	    
	    $($this).closest('li').toggleClass('details');
	   
	    
	});
});


var KBPlupload, kb_uploaders;

(function($){
	
	var 
	kb_uploaders	= {},
	hundredMB	= null,
	max		= null
	;
        
	KBPlupload = 
	{
	
		init : function () 
		{
			   
			// set flag to avoid, that this happens more than once
			KBInputs.plupload_init = true;
			KBPlupload.plupload();
			// init tabs
			$('.tabs').tabs();
			// init sortables
			KBPlupload.sortable();
                    
			$(document).on('click',' ul.kb-gallery-tab-list li', function(e)
			{	
			    e.preventDefault();
			    $(this).toggleClass('chosen');
				
			})
			
			$(document).on('click', '.kb_plupload_image-wrap a', function(e) {
			    e.preventDefault();
			    KBPlupload.deleteItem($(this));
			});			
                        
			$(document).on('click','.gallery-tab-add', function(e)
			{
			    
			    e.preventDefault();           
			    post_id = $('#post_ID').val();
			    blockid = activeBlock;
			    key = $(this)
			    .closest('.kb_block')
			    .find('.field-key')
			    .val();
                            
                   
			    $('.kb-gallery-tab-list li.chosen').each(function(){
				    el = $(this);
				    id = $(this).attr('data-id');
				    $(this).removeClass('chosen');
				    // ajax save post meta, not compatible with post preview
				    // KBPlupload.updateMeta(post_id, id, blockid, key, el);
			    KBPlupload.getImageMarkup(id, blockid, key);

			    })
			});
                    
			$('body').on('keyup','.kb-search', function(event) {
                       
				//if esc is pressed or nothing is entered
				if (event.keyCode == 27 || $(this).val() == '') {
                            
                        
					//if esc is pressed we want to clear the value of search box
					$(this).val('');

					//we want each row to be visible because if nothing
					//is entered then all rows are matched.
					$('#'+activeBlock+' .media-library li').show().addClass('visible');
				}

				//if there is text, lets filter
				else {
					KBPlupload.filterData('#'+activeBlock+' .item-description h4',$(this).val() );
				}
			});
			
        }, // end init
		
		sortable: function()
		{
			$('.kb-plupload-list').sortable({
				helper: 'clone',
				placeholder: 'ui-state-highlight'
				/*stop: function(event, ui){
					post_id = $('#post_ID').val();
					blockid = activeBlock;
					key = $(this)
					.closest('.kb_block')
					.find('.field-key')
					.val();
                            
					KBPlupload.imageResort(this, post_id, blockid, key);
				}*/
			});
		},
			
		plupload: function() {	
			 
			$('input:hidden.kb-plupload-id' ).each( function() 
			{
				prefix = $( this ).val();
				key = $(this)
				.closest('.kb_block')
				.find('.field-key')
				.val();
  
				blockid = $(this)
				.closest('.kb_block')
				.find('.block-id')
				.val();
                        
				// Adding container, browser button and drag ang drop area
				kb_plupload_init = $.extend( 
				{
					container:	prefix + '-container',
					browse_button:	prefix + '-browse-button',
					drop_element:	prefix + '-dragdrop'
				},
				kb_plupload_defaults 
				);


				// Create new uploader
				kb_uploaders[ prefix ] = new plupload.Uploader( kb_plupload_init );
				kb_uploaders[ prefix ].init();
				//
				kb_uploaders[ prefix ].bind( 
					'FilesAdded', 
					function( up, files )
					{
						hundredMB	= 100 * 1024 * 1024, 
						max		= parseInt( up.settings.max_file_size, 10 );
						$.each(
							files, 
							function(i, file )
							{
								if ( file.size >= max ){
									alert('Too large');
								} else {
                                                    
									$('#'+activeBlock+ ' .kb-queue').append(
										'<div id="' + file.id + '">' +
										file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
										'<div id="' + file.id +'_progress"></div>' +
                                        
										'</div>');
                                    
									$('#'+ file.id +'_progress').progressbar({
										value: 0
									});
                                    

								}
							} 
							);
						up.refresh();
						up.start();
					}
					);

				kb_uploaders[ prefix ].bind('BeforeUpload', function(up, file){
				// Add field_id to the ajax call
				
				key = $('#'+activeBlock)
				.find('.field-key')
				.val();
				
				up.settings.multipart_params['blockid'] = activeBlock;
				up.settings.multipart_params['field_key'] = key;
				});

				kb_uploaders[ prefix ].bind(
					'Error', 
					function( up, e ) 
					{
						alert('Error occured.')	
						up.removeFile(e.file);
					}
					);
                    
				kb_uploaders[ prefix ].bind('UploadProgress', function(up, file) {
                    
                    
					$('#' + file.id + " b").html(file.percent + "%");
					$('#'+ file.id +'_progress').progressbar({
						value: parseInt(file.percent)
						});

				});
                     
				kb_uploaders[ prefix ].bind('UploadComplete', function(up, file) {
                    
					$('#'+activeBlock+ ' .kb-queue div').each(function(i){
						$(this).delay(i*150).fadeTo(300,0, function(){
							$(this).remove();
						})
					})

				});


				kb_uploaders[ prefix ].bind(
					'FileUploaded', 
					function( up, file, response ) 
					{
					    var res = response;
					    
						    res = $.parseJSON(res.response)
						    
							
							img_id	= res.data;
							img_src	= res.supplemental.thumbnail;
							blockid = res.supplemental.blockid;
							key	= res.supplemental.key;
							KBPlupload.getImageMarkup(img_id, blockid, key);

						
					});
			});
		},
                    
                    
		
		
		imageResort: function(list, post_id, blockid, key){
			serialized = $(list).sortable("serialize",{
				key: 'id[]'
			});
			$.post(
				ajaxurl,
				{
					action: 'kb-field-plupload-resort', 
					blockid:blockid, 
					serialized: serialized, 
					post_id: post_id, 
					key:key
				},
				function(response){
					if (response == 1){
						KB.notice('<p>Sorting successful!</p>');              
					} else {
						KB.errornotice('error while updateing');
					}
                            
				}
				)
                  
		},
                
		updateMeta: function(post_id, id, blockid, key, el){
                  
			$.post(
				ajaxurl,
				{
					action: 'kb_field_plupload_update', 
					blockid:blockid, 
					attachment: id, 
					post_id: post_id, 
					key:key
				},
				function(response){
					if (response == 1){
						KBPlupload.getImageMarkup(id, blockid);
						$(el).removeClass('chosen').addClass('exists');   
					} else {
						alert('error while updateing');
					}
                            
				}
				);
                  
		},
                
		getImageMarkup:  function(id, blockid, key){
		    
		    
			$.post(
				ajaxurl, 
				{
					action: 'kb_field_plupload_img', 
					blockid: blockid, 
					attachment: id,
					key: key
				},
				function(response){
				    
					container = $('#'+activeBlock).find('.kb-plupload-list');
					newitem = $(response).hide();
					$(container).append(newitem);
					$(newitem).fadeTo(800,1);
				},
				"html"
				);
		}, // end getImageMarkup
                
		deleteItem: function(el){
			blockid     = activeBlock;
			item        = $(el).closest('li');
			attachment  = $(el).closest('li').attr('data-id');
			key         = $(el).closest('.kb_block').find('.field-key').val();
			post_id     = $('#post_ID').val();
                   
			$.post(
				ajaxurl, 
				{
					action: 'kb_plupload_delete_item', 
					blockid: blockid, 
					attachment: attachment, 
					key: key, 
					post_id: post_id
				},
				function(response){
                                   
					$(item).fadeTo(500,0, function(){
						$(this).remove();
					});
					if ($('.kb-gallery-tab-list')) {
                                   
						$('[data-id="'+attachment+'"]').removeClass('exists');
					}
                                        
				}

				);                    
                    
		},
                
		filterData: function(selector, query){
                    
			query = $.trim(query); //trim white space
			query = query.replace(/ /gi, '|'); //add OR for regex query
                   

			$(selector).each(function() {
				//($(this).text().search(new RegExp(query, "i")) < 0) ? $(this).parent('li').hide().removeClass('visible') : $(this).show().addClass('visible');
				($(this).text().search(new RegExp(query, "i")) < 0) ? $(this).closest('li').hide().removeClass('visible') : $(this).closest('li').show().addClass('visible');
			});
                    
                    
		}
		
	
	} // KBPlupload
		
	
// $(document).ready( KBPlupload.init );
})(jQuery);

