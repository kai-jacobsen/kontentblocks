var KB = KB || {};

KB.AreasCollection = Backbone.Collection.extend({}); 
var KB = KB || {};

KB.ModulesCollection = Backbone.Collection.extend({
    
}); 
var KB = KB || {};

KB.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id'
});
var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    initialize: function() {
        this.render();

    },
    render: function() {
        console.log(this);
    }
    

});
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