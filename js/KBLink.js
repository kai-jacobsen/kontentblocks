var KBLink;

(function($){
	
	var inputs = {}, restore_htmlUpdate, restore_isMce ;
	
	KBLink = 
	{
	
		init : function () 
		{
			$('body').live('click', '.kblink', function(e) {
					KBLink.start();
					e.preventDefault();
				});
			
			$('body').live('click', '.kblink-reset', function(e) {
					KBLink.remove();
					e.preventDefault();
				})
							

			
		},
		
		start : function () 
		{
			// set activeEditor, in this caseour textfield, dialog won't open if not set
			wpActiveEditor = $('#'+activeBlock).find('.kblink-text').attr('id');
			//open the dialog
			wpLink.open();
			
			// some field references			
			inputs.hidden_id = $('#'+activeBlock).find('.kblink-link_id');
			
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
			
			// Build HTML
			href = attrs.href;
			title = attrs.title;
							
			// Clear textarea
			jQuery(textarea).empty();
			
			//Append the Url to the textarea
			textarea.value = href;
			
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