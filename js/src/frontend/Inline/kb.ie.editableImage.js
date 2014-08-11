KB.IEdit.Image = (function ($) {

    var self, attachment;

    self = {
        selector: '.editable-image',
        remove: '.kb-js-reset-file',
        img: null,
        init: function () {
            var that = this;
            var $body = $('body');
            $body.on('click', this.selector, function (e) {
                e.preventDefault();
                that.img = $(this);
                that.parent = KB.currentModule;
                that.frame().open();
            });


            $body.on('click', this.remove, function (e) {
                e.preventDefault();
                that.container = $('.kb-field-file-wrapper', activeField);
                that.resetFields();
            });

            // add css properties when views are ready
            this.renderControls();

        },
        renderControls: function () {
            $(this.selector).each(function (index, obj) {
                $('body').on('mouseover', '.editable-image', function () {
                    $(this).css('cursor', 'pointer');
                });
            });
        },
        frame: function () {
            if (this._frame)
                return this._frame;

            this._frame = wp.media({
                title: KB.i18n.Refields.file.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: 'image'
                }
            });

            this._frame.on('ready', this.ready);

            this._frame.state('library').on('select', this.select);

            return this._frame;
        },
        ready: function () {
            $('.media-modal').addClass(' smaller no-sidebar');
        },
        select: function () {
            // this references _frame
            attachment = this.get('selection').first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function (attachment) {
            var that = this;
            var id = attachment.get('id');
            var value = this.prepareValue(attachment);
            var data = this.img.data();
            var mId = data.module;
            var cModule = KB.Modules.get(mId);
            var moduleData = _.clone(cModule.get('moduleData'));
            var path = data.kpath;
            KB.Util.setIndex(moduleData, path, value);

            var settings = KB.payload.FrontSettings[data.uid];
            cModule.set('moduleData', moduleData);


            jQuery.ajax({
                url: ajaxurl,
                data: {
                    action: 'fieldGetImage',
                    args: settings,
                    id: id,
                    _ajax_nonce: kontentblocks.nonces.get
                },
                type: 'GET',
                dataType: 'json',
                success: function (res) {
                    that.img.attr('src', res);
                    that.parent.$el.addClass('isDirty');

                },
                error: function () {

                }
            });
        },
        prepareValue: function (attachment) {
            return {
                id: attachment.get('id'),
                title: attachment.get('title'),
                caption: attachment.get('caption')
            };
        },
        resetFields: function () {
            $('.kb-file-attachment-id', this.container).val('');
            this.container.hide(750);
            $(this.remove, activeField).hide();
        },
        update: function () {
            this.init();
        }
    };

    return self;

}
(jQuery));
_.extend(KB.IEdit.Image, Backbone.Events);

