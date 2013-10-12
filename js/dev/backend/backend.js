'use strict';
var KBK = KBK || {};
KBK.Views = {};
KBK.Modules = new KB.ModulesCollection({
    model: KB.ModuleModel
});
KBK.Areas = new KB.AreasCollection(_.toArray(KBK.RawAreas), {
    model: KB.AreaModel
});
KBK.App = (function($) {

    function init() {
        
        KBK.Modules.on('add', createViews );
        
        addModules();
    }

    function addModules() {
        _.each(KBK.RawAreas, function(area) {
            if (area.modules) {
                _.each(area.modules, function(module) {
                    KBK.Modules.add(new KB.ModuleModel(module));
                });
            }
        });
    }
    
    function createViews(module){
        KBK.Views[module.get('instance_id')] =  new KB.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        });
    }
    

    return {
        init: init
    };

}(jQuery));
KBK.App.init();