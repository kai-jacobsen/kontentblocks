KB.Backbone.AreaLayoutView = Backbone.View.extend({
    hasLayout: false,
    LayoutIterator: null,
    initialize: function (options) {
        this.AreaView = options.AreaView;
        this.listenTo(this.AreaView, 'kb.module.created', this.handleModuleCreated);
        this.listenTo(this.AreaView, 'kb.module.deleted', this.handleModuleDeleted);

        this.listenTo(this.model, 'change:layout', this.handleLayoutChange);

        this.setupLayout();

        this.renderPlaceholder();
        /*
         * stop here if no layout is set
         */
        if (_.isNull(this.LayoutIterator)) {
            return false;
        }
        /*
         * set initial position
         */
    },
    /**
     * Setup the Layout Iterator
     * @returns this
     */
    setupLayout: function (layout) {
        var at, coll;
        coll = KB.payload.AreaTemplates || {};
        at = layout || this.model.get('layout');
        if (at === 'default') {
            this.hasLayout = false;
            return null;
        }

        if (coll[at]) {
            this.hasLayout = true;
            this.LayoutIterator = new KB.LayoutIterator(coll[at], this.AreaView);
            return this;
        } else {
            this.hasLayout = false;
        }
    },
    unwrap: function () {
        _.each(this.AreaView.getAttachedModules(), function (ModuleView) {
            ModuleView.$el.unwrap();
        });
    },
    render: function (e, ui) {
        if (this.hasLayout) {
            this.LayoutIterator.applyLayout(ui);
        } else {
            this.unwrap();
        }
    },
    applyClasses: function () {

        var prev = null;
        var $modules = this.AreaView.$el.find('.module');
        $modules.removeClass('first-module last-module repeater');
        for (var i = 0; i < $modules.length; i++) {
            var View = jQuery($modules[i]).data('ModuleView');
            if (_.isUndefined(View)) {
                continue;
            }

            if (i === 0) {
                View.$el.addClass('first-module');
            }

            if (i === $modules.length - 1) {
                View.$el.addClass('last-module');
            }

            if (View.model.get('settings').id === prev) {
                View.$el.addClass('repeater');
            }

            prev = View.model.get('settings').id;

            var $parent = View.$el.parent();

            if ($parent.hasClass('kb-wrap')) {
                $parent.attr('rel', View.$el.attr('rel'));
            }

        }
    },
    handleModuleCreated: function () {
        this.applyClasses();
        if (this.LayoutIterator) {
            this.LayoutIterator.applyLayout();
        }
    },
    handleModuleDeleted: function () {
        this.applyClasses();
        this.renderPlaceholder();

        if (this.LayoutIterator) {
            this.LayoutIterator.applyLayout();
        }
    },
    handleLayoutChange: function () {
        this.setupLayout();
        this.AreaView.setupSortables();
        this.render();
    },
    renderPlaceholder: function () {
        if (this.AreaView.getNumberOfModules() === 0) {
            this.AreaView.$el.addClass('kb-area__empty');
        }
    }
});
