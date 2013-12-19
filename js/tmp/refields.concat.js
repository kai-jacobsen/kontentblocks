var KB = KB || {};

KB.Fields.Color = (function($) {

	$(document).on('onsite::opened', function() {
		KB.Fields.Color.init();
	});

	return {
		init: function() {

			$(".kb-color-picker").wpColorPicker({
				change: function(event, ui) {
				},
				clear: function() {
					pickColor("");
				}
			});
		}
	};



}(jQuery));
KB.Fields.Color.init();
var KB = KB || {};

KB.Fields.Image = (function($) {
    var that = this;

    var selector = '.kb-js-add-image';
    var $container = null;
    var $wrapper = null;
    var $id, $title, $caption;

    var _frame = null;

    $(document).on('click', selector, function() {
        $container = $(this);
        $wrapper = $(this).parent();
        $id = $('.kb-js-image-id', $wrapper);
        $title = $('.kb-js-image-title', $wrapper);
        $caption = $('.kb-js-image-caption', $wrapper);
        openMediaDialog();
    });

    function openMediaDialog() {

        // opens dialog if not already declared
        if (_frame) {
            _frame.open();
            return;
        }

        _frame = wp.media({
            // Custom attributes
            title: 'My first Media Modal',
            button: {
                text: 'whooop'
            },
            multiple: false,
            library: {
                type: 'image'
            }
        });
        _frame.state('library').on('select', function() {
            // Get the selected attachment. Since we have disabled multiple selection
            // we want the first one of the collection.
            var attachment = this.get('selection').first();

            handleAttachment(attachment);
        });
 
        _frame.open();

    }
    function handleAttachment(attachment) {
        $container.html('<img src="' + attachment.get('sizes').thumbnail.url + '" >');
        $id.val(attachment.get('id')); 
        $title.val(attachment.get('title')); 
        $caption.val(attachment.get('caption')); 
        $(document).trigger('KB:osUpdate');
        
    }

}(jQuery));