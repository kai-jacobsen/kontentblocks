var KBDate;

(function($){
	
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
			    $.datepicker.setDefaults( $.datepicker.regional[ "de" ] );
			}				
	};
	
	
	
		$(document).ready( KBDate.init );
})(jQuery);