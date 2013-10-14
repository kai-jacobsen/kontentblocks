'use strict';
var KB = KB || {};
KB.Views = {};
KB.Modules = new KB.Backbone.ModulesCollection([],{
    model: KB.Backbone.ModuleModel
});
KB.Areas = new KB.Backbone.AreasCollection(_.toArray(KB.RawAreas), {
    model: KB.Backbone.AreaModel
});
KB.App = (function($) {

    function init() {
        KB.Modules.on('add', createViews );
        addModules();
    }

    function addModules() {
        _.each(KB.RawAreas, function(area) {
            if (area.modules) {
                _.each(area.modules, function(module) {
                    KB.Modules.add(new KB.Backbone.ModuleModel(module));
                });
            }
        });
    }
    
    function createViews(module){
        KB.Views[module.get('instance_id')] =  new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id'),
        });
    }
    
    return {
        init: init
    };

}(jQuery));
KB.App.init();