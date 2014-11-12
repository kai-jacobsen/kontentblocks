KB.Backbone.EditModalAreas = Backbone.View.extend({
    tagName: 'div',
    id: 'kb-area-modal',
    $target: null,
    $layoutList: null,
    AreaView: null,
    LayoutDefs: KB.payload.AreaTemplates || {},
    events: {
        'click li': 'layoutSelect',
        'click .close-controls': 'close'
    },
    initialize: function (options) {
        var that = this;
        this.setTarget(options.target);

        this.AreaView = options.AreaView;

        // add form skeleton to modal
        jQuery(KB.Templates.render('frontend/area-edit-form', {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        })).appendTo(this.$el);
        jQuery('body').append(this.$el);

        jQuery(window).on('resize', function () {
            that.reposition();
        });

        this.$layoutList = jQuery('ul', this.$el);


        this.render();
    },
    render: function () {
        this.$el.show();
        this.setOptions();
        this.reposition();
    },
    layoutSelect: function (e) {
        var $li = jQuery(e.currentTarget);
        this.AreaView.changeLayout($li.data('item'));
    },
    setModel: function (model) {
        this.model = model;
        return this;
    },
    setArea: function (AreaView) {
        this.AreaView = AreaView;
        return this;
    },
    setTarget: function (target) {
        this.$target = jQuery(target);
    },
    close: function () {
        this.$el.fadeOut(250);
    },
    setOptions: function () {
        var options = '';
        var layouts = this.model.get('layouts');
        this.$layoutList.find('li').remove();

        if (layouts && layouts.length > 0) {
            _.each(this.prepareLayouts(layouts), function (item) {
                options += KB.Templates.render('frontend/area-layout-item', {
                    item: item
                });
            });
            this.$layoutList.append(options);
        } else {

        }
    },
    prepareLayouts: function (layouts) {
        var that = this;
        var stored = this.model.get('settings').layout;
        return _.map(layouts, function (l) {
            if (that.LayoutDefs[l]) {
                var def =  that.LayoutDefs[l];

                if (def.id === stored){
                    def.currentClass = 'kb-active-area-layout';
                } else {
                    def.currentClass = '';
                }

                return def;
            }
        });
    },
    reposition: function () {
        var pos = this.$target.offset();
        var lh = this.$el.outerHeight();
        pos.top = pos.top - lh;
        this.$el.offset({top: pos.top, left: pos.left});
    }

});
