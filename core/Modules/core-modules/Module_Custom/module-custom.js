KB.CustomModule = function (view) {
    this.view = view;

    if (KBAppConfig.frontend) {

        return;
    } else {
        this.preInit(view);
        this.init();
    }

}

_.extend(KB.CustomModule.prototype, {
    preInit: function (view) {
        this.view = view;
        $ = jQuery;
        this.defaults = {
            content: '',
            imgid: null,
            imgsrc: null
        };
        this.elCount = 0;
        this.$wrapper = $('.kb-field--wrap', this.view.$el);
        this.$list = $('.kb-generic--list', this.$wrapper);
        this.instance_id = this.view.model.get('instance_id');
        this.$parentEl = this.view.$el;
        this.selector = '.kb-js--generic-create-item';
        this.template = $('.template', this.$wrapper).html();
    },
    init: function () {
        var that = this;
        this.$list.on('mouseover', '.kb-generic--list-item', function () {
            that.$currentItem = jQuery(this);
        });

        this.$wrapper.on('click', this.selector, function () {
            that.addItem();
        });

        this.$wrapper.on('click', '.kb-js-generic-toggle', function () {
            jQuery(this).next().slideToggle();

        });

        this.$wrapper.on('click', '.kb-js-add-custom', function () {

            that.$imgid = $('.kb-js-generic--imgid', that.$currentItem);
            that.$imgwrap = $('.kb-generic--image-wrapper', that.$currentItem);

            new KB.Utils.MediaWorkflow({
                select: _.bind(that.select, that)
            })
        });
        this.initialSetup();
    },
    addItem: function (data, index) {
        var moduleData = data || _.extend(this.view.model.get('moduleData'), this.defaults);
        this.count = index || jQuery('.kb-generic--list-item', this.$list).length;
        this.$list.append(_.template(this.template, _.extend({base: this.instance_id, counter: this.count}, moduleData)));
        var $el = jQuery('.kb-generic--list-item', this.$list).last().find('.kb-remote-editor');
        var editorName = $el.attr('data-name');
        KB.TinyMCE.remoteGetEditor($el, editorName, $el.html(), this.view.model.get('post_id'));
        jQuery('.kb-generic-tabs').tabs();
    },
    initialSetup: function () {
        var that = this;
        var data = this.view.model.get('moduleData');
        _.each(data.items, function (item) {
            that.addItem(item);
        });
    },
    viewLoaded: function (view) {
        this.preInit(view);
        this.init();
        KB.FrontendEditModal.recalibrate();
    },
    select: function (modal) {
        var attachment = modal.get('selection').first();
        var url = attachment.get('sizes').thumbnail;
        this.$imgid.val(attachment.get('id'));
        this.$imgwrap.empty().append('<img src="' + url.url + '" >');
    }

})
;


var CustomModule = (function ($) {

    return{
        init: function () {
            var that = this;

            var views = KB.Views.Modules.filterByModelAttr('class', 'Module_Custom');
            _.each(views, function (view) {
                view.CM = new KB.CustomModule(view);
                view.on('kb:frontend::viewLoaded', _.bind(view.CM.viewLoaded, view.CM));
                view.on('kb:backend::viewUpdated', that.listen);
                view.on('kb:moduleUpdated', that.listen);
            });

            KB.Views.Modules.on('kb:viewAdded', function (view) {
                console.log('ViewAdded', view);
            });

        },
        listen: function () {
            $('[data-ride="carousel"]').each(function () {
                var $carousel = $(this)
                $carousel.carousel($carousel.data())
            })
        }

    }


}(jQuery));
CustomModule.init();