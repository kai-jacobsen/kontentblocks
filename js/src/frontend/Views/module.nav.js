/**
 * Single module nav item
 * model refers to the parent view and is an actual Backbone View
 */
KB.Backbone.ModuleNavItem = Backbone.View.extend({
    initialize: function () {
        var that = this;
        // this.model refers to the moduleView
        this.el = KB.Templates.render('frontend/module-nav-item', {
            view: this.model.model.toJSON()
        });
        this.$el = jQuery(this.el);

        this.model.controlView = this;

        jQuery(window).scroll(function () {
            if (that.model.$el.visible(true, true)) {
                that.$el.addClass('in-viewport');
                that.$el.show(250);
            } else {
                that.$el.removeClass('in-viewport');
                that.$el.hide(250);
            }
        });

        this.model.$el.on('mouseenter', function () {
            that.$el.addClass('in-viewport-active');
        });

        this.model.$el.on('mouseleave', function () {
            that.$el.removeClass('in-viewport-active');
        });

    },
    events: {
        'mouseenter': 'over',
        'mouseleave': 'out',
        "click": 'scrollTo',
        "click .kb-module-nav-item__edit": "openControls",
        'click .kb-js-inline-update': 'inlineUpdate'
    },
    render: function () {
        return this.$el;
    },
    over: function () {
        this.model.$el.addClass('kb-nav-active');
    },
    out: function () {
        this.model.$el.removeClass('kb-nav-active');
    },
    openControls: function (e) {
        e.stopPropagation();
        this.model.openOptions();
    },
    inlineUpdate: function (e) {
        e.stopPropagation();
        this.model.updateModule();
        this.model.getClean();
    },
    scrollTo: function () {
        var that = this;
        jQuery('html, body').animate({
            scrollTop: that.model.$el.offset().top - 100
        }, 750);
    }

});

KB.Backbone.ModuleNavView = Backbone.View.extend({
    subviews: [],
    tagName: 'div',
    className: 'kb-module-nav-container',
    initialize: function () {
        // get or set show state to local storage
        this.show = _.isNull(KB.Util.stex.get('kb-nav-show')) ? true : KB.Util.stex.get('kb-nav-show');
        this.render();
    },
    events: {
        'click .kb-nav-toggle': 'toggleView',
        'mouseenter .kb-nav-toggle': 'over',
        'mouseleave .kb-nav-toggle': 'out'
    },
    render: function () {
        this.$el.appendTo('body');
        this.$list = jQuery('<ul></ul>').appendTo(this.$el);
        this.$toggle = jQuery('<div class="kb-nav-toggle genericon genericon-menu"></div>').appendTo(this.$el);

        if (this.show) {
            this.$el.addClass('kb-nav-show');
        }

    },
    attach: function (moduleView) {
        moduleView.ModuleNav = this;
        this.renderItem(moduleView);
    },
    renderItem: function (moduleView) {
        var Item = new KB.Backbone.ModuleNavItem({
            model: moduleView
        });

        this.$list.append(Item.render());
    },
    toggleView: function () {
        this.$el.toggleClass('kb-nav-show');
        this.$el.removeClass('kb-nav-show-partly');
        var show = !this.show;
        this.show = show;
        KB.Util.stex.set('kb-nav-show', show, 60 * 60 * 1000 * 24);
    },
    over: function () {
        if (!this.show) {
            this.$el.addClass('kb-nav-show-partly');
        }
    },
    out: function () {
        if (!this.show) {
            this.$el.removeClass('kb-nav-show-partly');
        }
    }


});