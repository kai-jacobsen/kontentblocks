'use strict';
var KB = KB || {};


KB.Views = {
    Modules: new KB.ViewsCollection,
    Areas: {}
};

KB.Modules = new KB.Backbone.ModulesCollection([], {
    model: KB.Backbone.ModuleModel
});

KB.Areas = new KB.Backbone.AreasCollection([], {
    model: KB.Backbone.AreaModel
});

KB.App = (function($) {

    function init() {
        KB.Modules.on('add', createModuleViews);
        KB.Areas.on('add', createAreaViews);
        KB.Modules.on('remove', removeModule);
        addViews();
    }

    function addViews() {
        _.each(KB.RawAreas, function(area) {
            KB.Areas.add(new KB.Backbone.AreaModel(area));

            if (area.modules) {
                _.each(area.modules, function(module) {
                    KB.Modules.add(module);
                });
            }
        });
    }


    function createModuleViews(module) {
        KB.Views.Modules.add(module.get('instance_id'), new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        })
                );
    }

    function createAreaViews(area) {
        KB.Views.Areas[area.get('id')] = new KB.Backbone.AreaView({
            model: area,
            el: '#' + area.get('id')
        });
    }

    function removeModule(model) {
        KB.Views.Modules.remove(model.get('instance_id'));
    }

    return {
        init: init
    };

}(jQuery));
KB.App.init();