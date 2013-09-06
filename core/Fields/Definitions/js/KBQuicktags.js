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