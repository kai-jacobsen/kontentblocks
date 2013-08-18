var KBProxy;

(function($){
	
	KBProxy = 
	{
	
	    
	    init: function() 
		    {
			
			var $this = KBProxy;
			var payload = {};
			
			 $(kbMetaBox).on('click', '.proxy-toggle', function(){
			     $(this).next().slideToggle(750);
			 });
			
			 $(kbMetaBox).on('change', '.block-select', function(){
			    $('#'+activeBlock+'_block_chosen').val($(this).val());
			    $('#'+activeBlock+'_select_block').removeAttr('disabled');
			    })
			    
			 $(kbMetaBox).on('click', '.proxy-select-block', function(){
			     $this.result(payload);
			 })
			
			 $(kbMetaBox).on('change', '.proxy-select', function(){
  
				getwhat = $(this).attr('rel');
				value = $(this).val();
				
				$section = $(this).closest('.proxy-section').toggleClass('loading');

				payload[getwhat] = value;

				KB.ajax({
				    payload	: payload,
				    type		: getwhat,
				    value	: value,
				    'action'	: 'proxy_get_'+ getwhat
				}, function(res){

				    $('#'+activeBlock+'_'+ getwhat).empty();
				    $('#'+activeBlock+'_'+ getwhat).append('<option>select one</option>');
				    $('#'+activeBlock+'_'+ getwhat).append(res);
				    $($section).closest('.proxy-section').toggleClass('loading');

					});
				})
		    },
		    
	    result: function(payload)
		    {
				KB.ajax({
				    payload	: payload,
				    'action'	: 'proxy_get_result'
				}, function(res){

				    result = res;
				    
				    container = $('#'+activeBlock+'_proxy_result');
				    holder = $('#'+activeBlock).find('.holder');
				    $(container).empty().append(result.html);
				    $(holder).slideToggle(750);
					});
		    }	    			
	}
	
	$(document).ready( KBProxy.init );
})(jQuery);