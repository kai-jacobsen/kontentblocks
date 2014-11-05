KB.Backbone.ModuleBrowserNavigation = Backbone.View.extend({

    item: Backbone.View.extend({
        initialize: function(options){
            this.options = options || {};
        },
        tagName: 'li',
        className: 'cat-item',
        events: {
            'click': 'change'
        },
        change: function () {
            this.options.parent.trigger('browser:change', this.model);
            this.$el.addClass('active');
            jQuery('li').not(this.$el).removeClass('active');
        },
        render: function () {
            var count = _.keys(this.model.get('modules')).length;
            var countstr = '(' + count + ')';

            if (count === 0) {
                return false;
            }

            if (this.options.parent.catSet === false){
                this.options.parent.catSet = true;
                this.options.browser.update(this.model);
                this.$el.addClass('active');
            }

            this.options.parent.$list.append(this.$el.html(this.model.get('name') + '<span class="module-count">' + countstr + '</span>'));
        }
    }),
    catSet: false,
    initialize: function (options) {
        var that = this;
        this.options = options || {};

        this.$list = jQuery('<ul></ul>').appendTo(this.$el);

        _.each(this.options.cats, function (cat) {
            var model = new Backbone.Model(cat);
            new that.item({parent: that, model: model, browser:that.options.browser}).render();
        });

    }

});