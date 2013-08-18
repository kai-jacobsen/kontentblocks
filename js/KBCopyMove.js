var KBCopyMove, post_id;

(function($){
	
	KBCopyMove = 
	{
    
	    data: {
		class : '',
		instance_id : '',
		payload : {}
	    },
	
	    init: function() {
		    $('.kb-copymove').live('click', function(e) {
			e.preventDefault();

			

			KBCopyMove.data.instance_id  = activeBlock;
			KBCopyMove.data.class	= $('#' + activeBlock).attr('data-blockclass');


			$('#kb-copymove').reveal({
			    open : function(){ open: KBCopyMove.modalOpen(); }
			});
		    });
		    
		    $('#kb-copymove').on('click', '.kb-copymove-send', function(e){
			e.preventDefault();
			KBCopyMove.copy();
		    })
		    
		    $('#kb-copymove').on('click', '.copymove-back', function(e){
			e.preventDefault();
			KBCopyMove.prevSlide();
		    });
		    
		     $('#kb-copymove').on('change', 'select', function(){

			getwhat = $(this).parent().attr('rel');
			value = $(this).val();


			if ( value === '')
			    return false;
			
			$section = $(this).closest('.copymove-section').toggleClass('loading');

			KBCopyMove.data.payload[getwhat] = value;


			KB.ajax({
			    type	: getwhat,
			    value	: value,
			    payload	: KBCopyMove.data.payload,
			    'action'	: 'copymove_get_'+ getwhat
			}, function(res){

			   $('#copymove_'+ getwhat).empty();
			  // $('#copymove_'+ getwhat).append('<option>select one</option>');
			   $('#copymove_'+ getwhat).html(res);
			    $($section).closest('.copymove-section').toggleClass('loading');
			    
			    KBCopyMove.nextSlide();
				});
			});
	    },
	    
	    modalOpen: function() {
		
		    
		
		    KB.ajax(
		    {
			    action:'kb_copymove',
			    data: KBCopyMove.data,
			    post_id: $('#post_ID').val()
		    }, 
		    function(response) 
		    {
			   $('#kb-copymove').html(response);
			   
		    });
		
		
	    },
	    
	    copy: function() {
		    KB.ajax(
		    {
			    action:'kb_copymove_copy',
			    data: KBCopyMove.data,
			    post_id: $('#post_ID').val()
		    }, 
		    function(response) 
		    {
			console.log(response);
			   //$('#kb-copymove').html(response);
			   
		    });		
	    },
	    
	    nextSlide: function() {
		
		var container = $('.copymove-wrapper');
		
		$(container).find('.holder').animate({top : '-=130px'}, 350);
		
	    },
		    
	    prevSlide: function() {
		
		var container = $('.copymove-wrapper');
		
		$(container).find('.holder').animate({top : '+=130px'}, 350);
		
	    }
	    
	};
	
	$(document).ready( KBCopyMove.init );
})(jQuery);