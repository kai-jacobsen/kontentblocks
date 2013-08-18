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