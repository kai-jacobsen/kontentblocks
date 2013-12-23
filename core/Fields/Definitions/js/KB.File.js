var KB = KB || {};

KB.Fields.register('File', (function($) {

	var self, attachment;

	self = {
		selector: '.kb-js-add-file',
		remove: '.kb-js-reset-file',
		container: null,
		init: function() {
			var that = this;
			$(this.selector).on('click', function(e) {
				e.preventDefault();
				that.container = $('.kb-field-file-wrapper', activeField);
				that.frame().open();
			});

			$(this.remove).on('click', function(e) {
				e.preventDefault();
				that.container = $('.kb-field-file-wrapper', activeField);
				that.resetFields();
			});

		},
		frame: function() {
			if (this._frame)
				return this._frame;

			this._frame = wp.media({
				title: KB.i18n.Refields.file.modalTitle,
				button: {
					text: KB.i18n.Refields.common.select
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
			$(this.remove, activeField).show();
			console.log($('.kb-file-attachment-id', this.container));
			this.container.show(750);
		},
		resetFields: function() {
			$('.kb-file-attachment-id', this.container).val('');
			this.container.hide(750);
			$(this.remove, activeField).hide();
		},
		update: function() {
			this.init();
		}
	};

	return self;

}(jQuery)));