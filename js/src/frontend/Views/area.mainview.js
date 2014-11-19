KB.Backbone.AreaView = Backbone.View.extend({
    isSorting: false,
    events: {
        'dblclick': 'openModuleBrowser'
    },
    initialize: function () {
        this.attachedModuleViews = {};
        //shorthand area settings from model
        this.settings = this.model.get('settings');
        this.listenToOnce(KB.Events, 'KB::frontend-init', this.setupUi);
        this.listenTo(this, 'kb.module.deleted', this.removeModule);

        if (KB.appData.config.useModuleNav) {
            KB.Menubar.attachAreaView(this);
        }
    },
    setupUi: function () {
        var that = this;

        this.Layout = new KB.Backbone.AreaLayoutView({
            model: new Backbone.Model(this.settings),
            AreaView: this
        });

        // Sortable
        if (this.model.get('sortable')) {
            this.setupSortables();
            _K.info('Area sortable initialized');
        } else {
            _K.info('Area sortable skipped');

        }
    },
    openModuleBrowser: function () {
        if (!this.ModuleBrowser) {
            this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }
        this.ModuleBrowser.render();
        return this.ModuleBrowser;
    },
    addModuleView: function (moduleView) {
        this.attachedModuleViews[moduleView.model.get('instance_id')] = moduleView; // add module
        this.listenTo(moduleView.model, 'change:area', this.removeModule); // add listener
        _K.info('Module:' + moduleView.model.id + ' was added to area:' + this.model.id);
    },

    getNumberOfModules: function () {
        return _.size(this.attachedModuleViews);
    },
    getAttachedModules: function () {
        return this.attachedModuleViews;
    },
    setupSortables: function () {
        var that = this;
        if (this.Layout.hasLayout) {
            this.$el.sortable(
                {
                    handle: ".kb-module-inline-move",
                    items: ".kb-wrap",
                    helper: 'original',
                    opacity: 0.5,
                    delay: 150,
                    placeholder: "kb-front-sortable-placeholder",
                    start: function (e, ui) {
                        //ui.placeholder.width('100%');
                        that.isSorting = true;
                        ui.placeholder.attr('class', ui.helper.attr('class'));
                        ui.placeholder.addClass('kb-front-sortable-placeholder');
                        ui.placeholder.append("<div class='module kb-dummy'></div>");

                        jQuery('.module', ui.helper).addClass('ignore');
                        ui.helper.addClass('ignore');
                    },
                    stop: function (e, ui) {
                        var serializedData = {};
                        that.isSorting = false;
                        serializedData[that.model.get('id')] = that.$el.sortable('serialize', {
                            attribute: 'rel'
                        });

                        jQuery('.ignore', ui.helper).removeClass('ignore');


                        return KB.Ajax.send({
                            action: 'resortModules',
                            data: serializedData,
                            _ajax_nonce: KB.Config.getNonce('update')
                        }, function () {
                            KB.Notice.notice('Order was updated successfully', 'success');
                            that.Layout.render();
                        }, that);
                    },
                    change: function (e, ui) {
                        that.Layout.applyClasses();
                        that.Layout.render(e, ui);
                    }
                });
        } else {
            this.$el.sortable(
                {
                    handle: ".kb-module-inline-move",
                    items: ".module",
                    helper: 'original',
                    opacity: 0.5,
                    //axis: "y",
                    delay: 150,
                    //forceHelperSize: true,
                    //forcePlaceholderSize: true,
                    placeholder: "kb-front-sortable-placeholder",
                    start: function(){
                        that.isSorting = true;
                    },
                    stop: function () {
                        var serializedData = {};
                        that.isSorting = false;

                        serializedData[that.model.get('id')] = that.$el.sortable('serialize', {
                            attribute: 'rel'
                        });

                        return KB.Ajax.send({
                            action: 'resortModules',
                            data: serializedData,
                            _ajax_nonce: KB.Config.getNonce('update')
                        }, function () {
                            KB.Notice.notice('Order was updated successfully', 'success');
                        }, that);
                    },
                    change: function () {
                        that.Layout.applyClasses();
                    }
                });
        }


    },
    changeLayout: function (l) {
        this.Layout.model.set('layout', l);
    },
    removeModule: function (ModuleView) {
        var id = ModuleView.model.get('mid');
        if (this.attachedModuleViews[id]) {
            delete this.attachedModuleViews[id];
        }
    }

});