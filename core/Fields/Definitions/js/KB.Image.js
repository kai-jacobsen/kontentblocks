var KB = KB || {};

KB.Fields.register('Image', (function ($) {
    'use strict';
    var self;

    self = {
        selector: '.kb-js-add-image',
        reset: '.kb-js-reset-image',
        _frame: null,
        $container: null,
        $wrapper: null,
        $id: null,
        $title: null,
        $caption: null,
        init: function () {
            var that = this;
            $('body').on('click', this.selector, function (e) {
                e.preventDefault();
                that.$container = $('.kb-field-image-container', activeField);
                that.$wrapper = $('.kb-field-image-wrapper', activeField);
                that.$id = $('.kb-js-image-id', that.$wrapper);
                that.$title = $('.kb-js-image-title', that.$wrapper);
                that.$caption = $('.kb-js-image-caption', that.$wrapper);
				that.openModal();
            });

        },
        frame: function () {
            if (this._frame)
                return this._frame;
        },
        openModal: function () {

            // opens dialog if not already declared
            if (this._frame) {
                this._frame.open();
                return;
            }

            this._frame = wp.media({
                // Custom attributes
                title: KB.i18n.Refields.image.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: 'image'
                }
            });

            this._frame.state('library').on('select', this.select);
            return this._frame;

        },
        select: function () {
            var attachment = this.get('selection').first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function (attachment) {
            this.$container.html('<img src="' + attachment.get('sizes').thumbnail.url + '" >');
            this.$id.val(attachment.get('id'));
            this.$title.val(attachment.get('title'));
            this.$caption.val(attachment.get('caption'));
            $(document).trigger('KB:osUpdate');

        },
        update: function () {
            this.init();
        }
    };
    return self;


}(jQuery)));