KB.Backbone.ModulesDefinitionsCollection = Backbone.Collection.extend({
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
            if (model.get('settings').hidden === true) {
                return;
            }
            var cat = (_.isUndefined(model.get('settings').category)) ? 'standard' : model.get('settings').category;
            that.categories[cat].modules.push(model);
        });
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