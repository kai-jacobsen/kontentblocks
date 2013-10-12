'use strict';
var KBK = KBK || {};
KBK.App = (function($) {

    var AreaCollection = new KB.AreasCollection();
    var Views = [];
    function init() {
        addModules();
    }

    function addModules() {

        _.each(KBK.Areas, function(area) {
            if (area.modules) {
                _.each(area.modules, function(module) {
                    AreaCollection.add(new KB.ModuleModel(module));
                });
            }
        });

        _.each(AreaCollection.models, function(model) {
            Views.push(new KB.ModuleView({
                el: '#' + model.get('instance_id'),
                model: model
            }));
        });

    }



    return {
        areas: AreaCollection,
        init: init
    };

}(jQuery));
KBK.App.init();