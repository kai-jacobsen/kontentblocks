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


