var KB = KB || {};

KB.Stuff = (function ($) {

    var self, attachment;

    self = {
        selector: '.editable-image',
        remove: '.kb-js-reset-file',
        img: null,
        init: function () {
            var that = this;
            $('body').on('click', this.selector, function (e) {
                e.preventDefault();
                that.img = $(this);
                that.frame().open();
            });

            $('body').on('click', this.remove, function (e) {
                e.preventDefault();
                that.container = $('.kb-field-file-wrapper', activeField);
                that.resetFields();
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
            var mId = this.img.attr('data-module');
            var fkey = this.img.attr('data-key');
            var settings = KB.fromServer.FrontSettings[mId][fkey];


            var moduleData = KB.CurrentModel.get('moduleData');
            moduleData[fkey] = _.extend(moduleData[fkey],{
                id:id
            });
            KB.CurrentModel.set('moduleData', moduleData);

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

                },
                error: function () {

                }
            });
        },
        resetFields: function () {
            $('.kb-file-attachment-id', this.container).val('');
            this.container.hide(750);
            $(this.remove, activeField).hide();
        },
        update: function () {
            this.init();
        }
    }
    ;

    return self;

}
    (jQuery)
    )
;
KB.Stuff.init();