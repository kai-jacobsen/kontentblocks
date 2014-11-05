KB.Backbone.AreaView = Backbone.View.extend({
    events: {
        'dblclick': 'openModuleBrowser'
    },
    initialize: function () {
        this.setupUi();
    },
    setupUi: function () {
        var that = this;
        var modules = this.$el.find('.module');
        if (modules.length === 0) {
            this.$el.addClass('kb-area__empty');
        }

        _.each(modules, function (item, index)
        {
            jQuery(item).attr('rel', item.id + '_' + index);
        });

        this.$el.sortable(
            {
                handle: ".kb-module-inline-move",
                items: ".module",
                helper: 'clone',
                opacity: 0.5,
                axis: "y",
                delay: 150,
                forceHelperSize: true,
                forcePlaceholderSize: true,
                placeholder: "kb-front-sortable-placeholder",
                stop: function () {
                    var serializedData = {};

                    serializedData[that.model.get('id')] = that.$el.sortable('serialize', {
                        attribute: 'rel'
                    });

                    return KB.Ajax.send({
                        action: 'resortModules',
                        data: serializedData,
                        _ajax_nonce: KB.Config.getNonce('update')
                    });
                }
            });
    },
    openModuleBrowser: function () {
        if (!this.ModuleBrowser) {
            this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }
        this.ModuleBrowser.render();
    },
    addModuleView: function (moduleView) {
        this.attachedModuleViews[moduleView.model.get('instance_id')] = moduleView; // add module
        this.listenTo(moduleView.model, 'change:area', this.removeModule); // add listener
        _K.info('Module:' + moduleView.model.id + ' was added to area:' + this.model.id);
        //moduleView.model.area = this.model;
        moduleView.model.areaView = this;
        this.ui();
    },

});