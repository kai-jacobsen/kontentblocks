KB.Stuff = (function ($) {

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
                that.frame().open();
            });


            $body.on('click', this.remove, function (e) {
                e.preventDefault();
                that.container = $('.kb-field-file-wrapper', activeField);
                that.resetFields();
            });

//            KB.on('kb:moduleControlsAdded', function(){
//                that.renderControls();
//            });

        },
//        renderControls: function () {
//            $(this.selector).each(function (index, obj) {
//                var mid = $(this).attr('data-module');
//                $(this).css('cursor', 'pointer');
//                $('<li><a>Click to change image</a></li>').appendTo($('#' + mid + ' .controls-wrap'));
//            });
//        },
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
            var settings = KB.payload.FrontSettings[mId][fkey];


            var cModule = KB.Modules.get(mId);
            var moduleData = cModule.get('moduleData');
            moduleData[fkey] = _.extend(moduleData[fkey], {
                id: id
            });
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


var KB = KB || {};

KB.StuffBG = (function ($) {

    var self, attachment;

    self = {
        selector: '.editable-bg-image',
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

            this.renderControls();
        },
        renderControls: function () {
            var temp;
            $(this.selector).each(function (index, obj) {
                $(obj).hover(function () {
                    var pos = $(this).offset();
                    var width = $(this).width();
                    var mid = $(this).attr('data-module');
                    console.log(mid);
                    $(this).css('cursor', 'pointer');
                    temp = $('<div style="padding: 5px; background-color: #333; color: #fff; opacity: .9; font-size:11px;">Click to change image</div>').appendTo($('#' + mid + ' .controls-wrap')).css({
                        'position': 'absolute',
                        'top': pos.top + 80 + 'px',
                        'left': width + pos.left - 135 + 'px'
                    });
                }, function () {
                    $(this).css('cursor', 'inherit');
                    temp.remove();
                });
            });
        },
        frame: function () {
            if (this._frame)
                return this._frame;

            this._frame = wp.media({
                title: 'Hello',
                button: {
                    text: 'Insert'
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
            var settings = KB.payload.FrontSettings[mId][fkey];


            var cModule = KB.Modules.get(mId);
            var moduleData = cModule.get('moduleData');
            moduleData[fkey] = _.extend(moduleData[fkey], {
                id: id
            });
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
                    that.img.css('backgroundImage', "url('" + res + "')");
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
KB.StuffBG.init();