var KBAreaSelector;

(function($){
	
	
	KBAreaSelector = 
	{
	
		init : function () 
		{
			$('#existing-areas, #active-dynamic-areas').sortable({
			    connectWith: '.connect',
			    cancel: "li.ui-state-disabled",
			    placeholder: "sortable-placeholder",
			    helper: "clone",
			    receive: function(event, ui)
			    {
				item = ui.item;
				id = $(item).attr('id');
				
				$(item).toggleClass('dynamic-area-active');
				
				if (this.id == 'active-dynamic-areas')
				{
				    action = "<span><a href=''>edit</a></span>";
				    
				    content = "<input id='"+id+"_hidden' type='hidden' name='active_sidebar_areas[]' value='"+id+"' />";
				    $(item).append(content);
				}
				else
				{
				    $('input#'+id+'_hidden').remove();
				    
				}
			    }
			})
		}
	
	}
		
	
	$(document).ready( KBAreaSelector.init );
})(jQuery);


jQuery(document).ready(function($) {

    $("body").on('click', '.reveal', function(e) {
	
	e.preventDefault();
	target = $(this).attr('data-url');
	height = $(window).height();
	console.log(target);
	$('#da-frame').attr('src', target).attr('height', height - 200);

	$("#da-modal").reveal({animation: 'fade'});

	$(window).resize(function() {
	    height = $(window).height();
	    $('#da-frame').attr('height', height - 200);
	});


    });

});