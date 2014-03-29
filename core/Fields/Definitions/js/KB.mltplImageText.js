var KB = KB || {};
KB.MultipleImageText = function (view) {
    this.view = view;
    this.view.on('kb:frontend::viewLoaded', _.bind(this.viewLoaded, this));
    this.view.on('kb:backend::viewUpdated', this.listen);
    this.view.on('kb:frontend::viewUpdated', _.bind(this.listen, this));
    this.view.on('kb:viewAdded', _.bind(this.preInit, this));
};

_.extend(KB.MultipleImageText.prototype, {

    preInit: function () {
        _K.log('MultipleImageText preInit called');
        // shorthand jquery
        $ = jQuery;
        // default field values
        this.defaults = {
            content: '',
            imgid: null,
            imgsrc: null,
            label: ''
        };
        // item count
        this.elCount = 0;

        // Elements
        // --------

        // wrapper div
        this.$wrapper = $('.kb-field--wrap', this.view.$el);
        // list el
        this.$list = $('.kb-generic--list', this.$wrapper);
        // view parent el
        this.$parentEl = this.view.$el;
        // add item button
        this.selector = '.kb-js--generic-create-item';

        // item underscore template, loaded async.
        this.template = $('.template', this.$wrapper).html();
        // module instance id
        this.instance_id = this.view.model.get('instance_id');
        // init

        this.init();
    },
    init: function () {
        var that = this;
        // set current item as reference
        this.$list.on('mouseover', '.kb-generic--list-item', function () {
            that.$currentItem = jQuery(this);
        });

        // bind the 'add new' button
        this.$wrapper.on('click', this.selector, function () {
            that.addItem();
        });

        this.$wrapper.on('click', '.kb-js-generic-toggle', function () {
            jQuery(this).not('input').next().slideToggle(350, function () {
                // resize the modal to new height if editing on frontend
                if (KB.FrontendEditModal) {
                    KB.FrontendEditModal.recalibrate();
                }
            });
        });

        this.$wrapper.on('click', '.kb-js-add-custom', function () {

            that.$imgid = $('.kb-js-generic--imgid', that.$currentItem);
            that.$imgwrap = $('.kb-generic--image-wrapper', that.$currentItem);

            if (that.modal) {
                that.modal.open();
            } else {
                that.modal = KB.Utils.MediaWorkflow({
                    select: _.bind(that.select, that),
                    buttontext: 'Insert',
                    title: 'Insert or upload an image'
                })
            }
        });

        this.$wrapper.on('click', '.kb-js-generic--delete', function (e) {
            $(e.currentTarget).closest('.kb-generic--list-item').hide(150).remove();
        });
        this.initialSetup();
    },
    initialSetup: function () {
        var that = this;
        var mid = this.view.model.get('instance_id');
        // create items from existing data
        if (!KB.payload.fieldData){
            return false;
        }
        var data = (KB.payload.fieldData['mltpl-image-text']) ? KB.payload.fieldData['mltpl-image-text'][mid] : [];
        _.each(data, function (item) {
            that.addItem(item);
        });

        // init sortable
        $('.kb-generic--list').sortable({
            handle: '.kb-js-generic--move',
            stop: function () {
                KB.TinyMCE.restoreEditors();
            },
            start: function () {
                KB.TinyMCE.removeEditors();
            }
        })
    },
    addItem: function (data, index) {
        var moduleData = data || _.extend(this.defaults, this.view.model.get('moduleData'));
        this.count = index || jQuery('.kb-generic--list-item', this.$list).length;
        this.$list.append(_.template(this.template, _.extend({base: this.instance_id, counter: this.count}, moduleData)));
        var $el = jQuery('.kb-generic--list-item', this.$list).last().find('.kb-remote-editor');
        var editorName = $el.attr('data-name');
        KB.TinyMCE.remoteGetEditor($el, editorName, $el.html(), this.view.model.get('post_id'), false);
        jQuery('.kb-generic-tabs').tabs();
    },
    viewLoaded: function (externalView) {
        if (externalView) {
            this.view = externalView;
        }
        this.preInit();
        KB.FrontendEditModal.recalibrate();
    },
    select: function (modal) {
        var attachment = modal.get('selection').first();
        var url = attachment.get('sizes').large;
        this.$imgid.val(attachment.get('id'));
        this.$imgwrap.empty().append('<img src="' + url.url + '" >');
    },
    listen: function () {

        $(window).trigger('resize');
        initFlicker(this.view.parentView.el);
    }

});

// bootstrap
(function ($) {
    return{
        // do nothing for logged out users
        init: function () {
            var that = this;
            if (KB.appData && !KB.appData.config.loggedIn) {
                return;
            }
            KB.on('kb:Module_MultipleImageText:added', function (view) {
                view.MIT = new KB.MultipleImageText(view);
                view.MIT.preInit.call(view.MIT);

            });

            KB.on('kb:Module_MultipleImageText:loaded', function (view) {
                view.MIT = new KB.MultipleImageText(view);
                view.MIT.preInit.call(view.MIT);
            });

            KB.on('kb:Module_MultipleImageText:loadedOnFront', function (view) {
                view.MIT = new KB.MultipleImageText(view);
            });

        }
    }
}(jQuery).init());


function initFlicker(scope) {
    jQuery('.flicker', jQuery(scope)).flicker({
        'arrows': true,
        'auto_flick': false,
        'auto_flick_delay': 10,
        'dot_navigation': true,
        'block_text': false,
        'flick_animation': 'transition-slide',
        'theme': 'light'
    });
}

jQuery(document).ready(function ($) {

    if (KB.appData && KB.appData.config.frontend) {
        initFlicker('body');
    }

});