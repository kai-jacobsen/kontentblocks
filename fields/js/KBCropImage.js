

var KBCropImage;

(function($){
	
	KBCropImage = 
	{
	
		init: function() 
		{
            return false;
			$('body').on('click', '.add-crop-image-link', function(e){	   
			    target = $(this).attr('rel');
			    tb_show('', target);
			    e.preventDefault();
			    KBCropImage.tb_position();
			    
			    KBCropImage['cropImage'] = $(this).parent().find('.crop-image-data');
			    KBCropImage['imageHolder'] = $(this).parent().find('.crop-image-holder');
			})
			 
			$(window).bind('tb_unload', function() {
			   KBCropImage.unload();
			});
			   			
		},
		tb_position: function()
		{
		    thickbox = $(top.document).find('#TB_window');
		    frame = $(top.document).find('#TB_iframeContent');
		    
		    winW = Math.round($(top.window).width() * 0.9);
		    winH = Math.round($(top.window).height() * 0.9);
		    width = 960;
		    $(frame).css({width: width + 'px'});

		   
		    
		    
		    $(thickbox).css('top:', '10%');

		    $(thickbox).animate({
			'width' : width + 'px',
			'marginLeft' : -width/2 + 'px'
		    })
		},
		unload : function()
		{
		    tb_remove();
		},
		
		insert : function()
		{
		    id = KBCropImage.attachment_id;
		    input = KBCropImage.cropImage;
		    holder = KBCropImage.imageHolder;
		    
		    oldimg = $(holder).find('img');
		    
		    $(input).val(id);
		    
		    $.post(
			ajaxurl,
			{
				action: 'kb_get_crop_image',
				id : id
			},
			function(response) {
			    res = $.parseJSON(response);
			    
			    if (oldimg)
				$(oldimg).remove();
			    
			    $(holder).append('<img src=' +res.src+' >');
			    KBCropImage.unload();
			}); 
		}
	}
	
	
	
	$(document).ready( KBCropImage.init );
})(jQuery);



