KB.Backbone.ModuleNavItem = Backbone.View.extend({

    initialize: function () {
        var that = this;
        this.el = KB.Templates.render('frontend/module-nav-item', {
            view: this.model.model.toJSON()
        });
        this.$el = jQuery(this.el);

        this.model.controlView = this;

        jQuery(window).scroll(function(){
            if (that.model.$el.visible(true,true)){
                that.$el.addClass('in-viewport');
                that.$el.fadeTo(350,1);
            } else {
                that.$el.removeClass('in-viewport');
                that.$el.fadeTo(350,0.7);
            }
        });

        this.model.$el.on('mouseenter', function(){
            that.$el.addClass('in-viewport-active');
        });

        this.model.$el.on('mouseleave', function(){
            that.$el.removeClass('in-viewport-active');
        });

    },
    events: {
        'mouseenter': 'over',
        'mouseleave': 'out',
        "click": 'scrollTo',
        "click .kb-module-nav-item--edit": "openControls",
        'click .kb-js-inline-update': 'inlineUpdate'
    },
    render: function () {
        return this.$el;
    },
    over: function () {
        this.model.$el.addClass('kb-nav-active');
    },
    out: function(){
        this.model.$el.removeClass('kb-nav-active');
    },
    openControls: function(e){
        e.stopPropagation();
        this.model.openOptions();
    },
    inlineUpdate:function(){
        this.model.updateModule();
        this.model.getClean();
    },
    scrollTo: function(){
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
        this.render();
    },
    render: function () {
        this.$el.appendTo('body');
        this.$list = jQuery('<ul></ul>').appendTo(this.$el);
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
    }


});