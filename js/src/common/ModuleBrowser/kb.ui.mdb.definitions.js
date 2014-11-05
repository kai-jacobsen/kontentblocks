KB.Backbone.ModulesDefinitionsCollection = Backbone.Collection.extend({

    initialize: function(models, options){
        this.area = options.area;
    },
    setup: function () {
        this.categories = this.prepareCategories();
        this.sortToCategories();
        return this;
    },
    getModules: function(id){
        return this.categories[id].modules;
    },
    sortToCategories: function () {
        var that = this;
        _.each(this.models, function (model) {

            if (!that.validateVisibility(model)){
                    return;
            }

            var cat = (_.isUndefined(model.get('settings').category)) ? 'standard' : model.get('settings').category;
            that.categories[cat].modules.push(model);
        });
    },
    validateVisibility: function(m){
        if (m.get('settings').hidden){
            return false;
        }

        if (m.get('settings').disabled){
            return false;
        }

        return !(!m.get('settings').globallyAvailable && this.area.model.get('dynamic'));

    },
    prepareCategories: function () {
        var cats = {};
        _.each(KB.payload.ModuleCategories, function (item, key) {
            cats[key] = {
                id: key,
                name: item,
                modules: []
            };
        });
        return cats;
    }
});