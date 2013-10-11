'use strict';
var KBK = KBK || {};
KBK.App = (function($) {

    var AreaCollection = new KB.AreasCollection({
        model: KB.ModuleModel
    });

    function init() {
        console.log(this);
        addModules();
    }

    function addModules() {

        _.each(KBK.Areas, function(area) {
            console.log(area.modules);
             AreaCollection.add(area.modules);
        });

    }

    return {
        Areas: AreaCollection,
        init: init 
    };

}(jQuery));
KBK.App.init();