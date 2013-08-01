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