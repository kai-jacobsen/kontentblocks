var KB = KB || {};

KB.AreasCollection = Backbone.Collection.extend({
}); 
var KB = KB || {};

KB.ModulesCollection = Backbone.Collection.extend({
}); 
var KB = KB || {};

KB.AreaModel = Backbone.Model.extend({
    idAttribute: 'id'
});
var KB = KB || {};

KB.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id'
});
'use strict';

var KB = KB || {};

KB.ModuleMenuView = Backbone.View.extend({
    
    $menuWrap : null,
    items : [],
    
    initialize: function(){
        this.$menuWrap = jQuery('.menu-wrap', this.$el);
        
    }
});
var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    
    $head: null,
    $body: null,
    ModuleMenu: null,
    
    initialize: function() {
        this.$head = jQuery('.block-head', this.$el);
        this.$body = jQuery('.kb_inner', this.$el);
        this.ModuleMenu = new KB.ModuleMenuView({
            el: this.$head,
            parent: this
        });
    },
    events: {
        'click .js-module-delete' : 'deleteModule',
        'click .js-module-status' : 'changeModuleStatus',
        'click .js-module-duplicate' : 'duplicateModule'
    },
    render: function() {
    },
    deleteModule: function(){
        console.log('delete');
    },
    changeModuleStatus: function(){
        this.$head.toggleClass('module-inactive');
    },
    duplicateModule: function(){
        console.log('duplicate');
    },
    getStatus: function(){
        return this.model.get('active');
    }
    
    
    

});
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