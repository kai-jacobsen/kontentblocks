var KB = KB || {};

KB.Fields.File = (function($) {

	var self, attachment;

	self = {
		selector: '.kb-js-add-file',
		container: null,
		init: function() {
			var that = this;
			$(this.selector).on('click', function() {
				that.container = $(activeField);
				that.frame().open();
			});
		},
		frame: function() {
			if (this._frame)
				return this._frame;

			this._frame = wp.media({
				title: 'Select a file',
				button: {
					text: 'Select'
				},
				multiple: false,
				library: {
					type: 'application'
				}
			});

			this._frame.on('ready', this.ready);

			this._frame.state('library').on('select', this.select);

			return this._frame;
		},
		ready: function() {
			$('.media-modal').addClass(' smaller no-sidebar');
		},
		select: function() {
			// this references _frame
			attachment = this.get('selection').first();
			self.handleAttachment(attachment);
		},
		handleAttachment: function(attachment) {
			$('.kb-file-filename', this.container).html(attachment.get('filename'));
			$('.kb-file-attachment-id', this.container).val(attachment.get('id'));
			$('.kb-file-title', this.container).html(attachment.get('title'));
			$('.kb-file-id', this.container).html(attachment.get('id'));
			$('.kb-file-editLink', this.container).attr('href', attachment.get('editLink'));

		}
	};

	return self;

}(jQuery));
KB.Fields.File.init();